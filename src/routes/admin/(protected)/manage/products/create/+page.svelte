<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetTrigger
	} from '$lib/components/ui/sheet';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Image, Plus, X } from '@lucide/svelte';

	let title = $state('');
	let slug = $state('');
	let categoryId = $state<string | null>(null);
	let description = $state('');
	let price = $state('');
	let sku = $state('');
	let stock = $state('0');
	let isActive = $state(true);
	let selectedTags = $state<string[]>([]);
	let newTag = $state('');
	let newCategoryName = $state('');
	let newCategoryDescription = $state('');
	let isCreatingCategory = $state(false);
	let selectedImages = $state<
		Array<{
			id: number;
			imageUrl: string;
			thumbUrl: string;
			filename: string;
		}>
	>([]);
	let coverImageId = $state<number | null>(null);
	let isSaving = $state(false);
	let error = $state<string | null>(null);

	// Categories
	let categories = $state<
		Array<{
			id: number;
			name: string;
			slug: string;
			description: string | null;
		}>
	>([]);
	let isLoadingCategories = $state(true);

	// Available tags
	let availableTags = $state<string[]>([]);
	let isLoadingTags = $state(true);

	// Image selection sidebar
	let isImageSidebarOpen = $state(false);
	let allImages = $state<
		Array<{
			id: number;
			imageUrl: string;
			thumbUrl: string;
			filename: string;
			title: string | null;
			description: string | null;
			tags: string[];
		}>
	>([]);
	let imageSearchQuery = $state('');
	let imageSelectedTags = $state<string[]>([]);
	let selectedImageIds = $state<number[]>([]);

	async function loadCategories() {
		try {
			isLoadingCategories = true;
			const response = await fetch('/api/categories');
			if (!response.ok) {
				throw new Error('Failed to load categories');
			}
			categories = await response.json();
		} catch (err) {
			console.error('Error loading categories:', err);
		} finally {
			isLoadingCategories = false;
		}
	}

	async function loadAvailableTags() {
		try {
			isLoadingTags = true;
			const response = await fetch('/api/products/tags');
			if (!response.ok) {
				throw new Error('Failed to load tags');
			}
			availableTags = await response.json();
		} catch (err) {
			console.error('Error loading tags:', err);
		} finally {
			isLoadingTags = false;
		}
	}

	async function loadImages() {
		try {
			const response = await fetch('/api/images');
			if (!response.ok) {
				throw new Error('Failed to load images');
			}
			allImages = await response.json();
		} catch (err) {
			console.error('Error loading images:', err);
		}
	}

	function generateSlug() {
		slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	function resetSlug() {
		generateSlug();
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function addNewTag() {
		const trimmedTag = newTag.trim();
		if (trimmedTag && !selectedTags.includes(trimmedTag)) {
			selectedTags = [...selectedTags, trimmedTag];
			newTag = '';
		}
	}

	function removeTag(tag: string) {
		selectedTags = selectedTags.filter((t) => t !== tag);
	}

	async function createCategory() {
		if (!newCategoryName.trim()) {
			toast.error('Category name is required');
			return;
		}

		isCreatingCategory = true;
		try {
			const formData = new FormData();
			formData.append('name', newCategoryName.trim());
			formData.append(
				'slug',
				newCategoryName
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-+|-+$/g, '')
			);
			if (newCategoryDescription.trim()) {
				formData.append('description', newCategoryDescription.trim());
			}

			const response = await fetch('/api/categories', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create category');
			}

			const newCategory = await response.json();

			// Add to categories list and select it
			categories = [newCategory, ...categories];
			categoryId = newCategory.id.toString();

			// Clear form
			newCategoryName = '';
			newCategoryDescription = '';

			toast.success('Category created successfully!');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
			toast.error(errorMessage);
			console.error('Error creating category:', err);
		} finally {
			isCreatingCategory = false;
		}
	}

	function toggleImageSelection(imageId: number) {
		if (selectedImageIds.includes(imageId)) {
			selectedImageIds = selectedImageIds.filter((id) => id !== imageId);
		} else {
			selectedImageIds = [...selectedImageIds, imageId];
		}
	}

	function addSelectedImages() {
		const imagesToAdd = allImages.filter((img) => selectedImageIds.includes(img.id));
		selectedImages = [...selectedImages, ...imagesToAdd];
		selectedImageIds = [];
		imageSearchQuery = '';
		imageSelectedTags = [];
		isImageSidebarOpen = false;
		toast.success(`Added ${imagesToAdd.length} image(s) to product`);
	}

	function removeImage(imageId: number) {
		selectedImages = selectedImages.filter((img) => img.id !== imageId);
		if (coverImageId === imageId) {
			coverImageId = null;
		}
	}

	function setCoverImage(imageId: number) {
		coverImageId = imageId;
	}

	function filterImages() {
		let filtered = allImages;

		// Filter by search query
		if (imageSearchQuery.trim()) {
			const query = imageSearchQuery.toLowerCase();
			filtered = filtered.filter(
				(image) =>
					image.title?.toLowerCase().includes(query) ||
					image.filename.toLowerCase().includes(query) ||
					image.description?.toLowerCase().includes(query)
			);
		}

		// Filter by selected tags
		if (imageSelectedTags.length > 0) {
			filtered = filtered.filter(
				(image) => image.tags && imageSelectedTags.some((tag) => image.tags!.includes(tag))
			);
		}

		return filtered;
	}

	async function handleSubmit() {
		if (!title.trim()) {
			error = 'Title is required';
			toast.error('Title is required');
			return;
		}

		if (!slug.trim()) {
			error = 'Slug is required';
			toast.error('Slug is required');
			return;
		}

		if (!categoryId) {
			error = 'Category is required';
			toast.error('Category is required');
			return;
		}

		if (!price.trim()) {
			error = 'Price is required';
			toast.error('Price is required');
			return;
		}

		if (!sku.trim()) {
			error = 'SKU is required';
			toast.error('SKU is required');
			return;
		}

		isSaving = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('title', title.trim());
			formData.append('slug', slug.trim());
			formData.append('categoryId', categoryId!);
			if (description.trim()) {
				formData.append('description', description.trim());
			}
			formData.append('price', price.trim());
			formData.append('sku', sku.trim());
			formData.append('stock', stock.trim());
			formData.append('isActive', isActive.toString());
			if (selectedTags.length > 0) {
				formData.append('tags', selectedTags.join(','));
			}
			if (selectedImages.length > 0) {
				formData.append('imageIds', selectedImages.map((img) => img.id).join(','));
			}
			if (coverImageId) {
				formData.append('coverImageId', coverImageId.toString());
			}

			const response = await fetch('/api/products', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create product');
			}

			const result = await response.json();
			console.log('Product created successfully:', result);

			toast.success('Product created successfully!');
			goto('/admin/manage/products');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error creating product:', err);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		toast.info('Product creation cancelled');
		history.back();
	}

	// Load data on component mount
	$effect(() => {
		loadCategories();
		loadAvailableTags();
		loadImages();
	});
</script>

<div class="max-w-4xl mx-auto p-6">
	<h1 class="text-2xl font-semibold mb-6">Create New Product</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-6"
	>
		<!-- Basic Information -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="space-y-2">
				<Label for="title">Title *</Label>
				<Input id="title" bind:value={title} oninput={generateSlug} required />
			</div>

			<div class="space-y-2">
				<Label for="slug">Slug *</Label>
				<div class="flex gap-2">
					<Input id="slug" bind:value={slug} required class="flex-1" />
					<Button
						type="button"
						variant="outline"
						onclick={resetSlug}
						disabled={!title.trim()}
						class="whitespace-nowrap"
					>
						Reset
					</Button>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="category">Category *</Label>
				<Select.Root type="single" bind:value={categoryId}>
					<Select.Trigger class="w-full">
						{categoryId
							? categories.find((c) => c.id.toString() === categoryId)?.name
							: 'Select a category'}
					</Select.Trigger>
					<Select.Content>
						{#each categories as category}
							<Select.Item value={category.id.toString()} label={category.name}>
								{category.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<!-- Add New Category -->
				<div class="space-y-2 mt-4 p-4 border rounded-lg bg-gray-50">
					<Label class="text-sm text-gray-600">Add New Category</Label>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						<Input
							bind:value={newCategoryName}
							placeholder="Category name"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									createCategory();
								}
							}}
						/>
						<Input
							bind:value={newCategoryDescription}
							placeholder="Description (optional)"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									createCategory();
								}
							}}
						/>
					</div>
					<Button
						type="button"
						variant="outline"
						onclick={createCategory}
						disabled={!newCategoryName.trim() || isCreatingCategory}
						class="w-full"
					>
						{isCreatingCategory ? 'Creating...' : 'Add Category'}
					</Button>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="sku">SKU *</Label>
				<Input id="sku" bind:value={sku} required />
			</div>

			<div class="space-y-2">
				<Label for="price">Price (₹) *</Label>
				<Input id="price" bind:value={price} type="number" step="0.01" min="0" required />
			</div>

			<div class="space-y-2">
				<Label for="stock">Stock</Label>
				<Input id="stock" bind:value={stock} type="number" min="0" />
			</div>
		</div>

		<!-- Description -->
		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				bind:value={description}
				rows={4}
				placeholder="Product description..."
			/>
		</div>

		<!-- Tags -->
		<div class="space-y-4">
			<Label>Tags</Label>

			<!-- Selected Tags -->
			{#if selectedTags.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each selectedTags as tag}
						<div
							class="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
						>
							<span>{tag}</span>
							<button
								type="button"
								onclick={() => removeTag(tag)}
								class="text-blue-600 hover:text-blue-800 ml-1"
							>
								×
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Available Tags -->
			{#if !isLoadingTags && availableTags.length > 0}
				<div class="space-y-2">
					<Label class="text-sm text-gray-600">Available Tags</Label>
					<div class="flex flex-wrap gap-2">
						{#each availableTags as tag}
							<button
								type="button"
								onclick={() => toggleTag(tag)}
								class="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors {selectedTags.includes(
									tag
								)
									? 'bg-blue-50 border-blue-200 text-blue-700'
									: 'bg-white border-gray-200 text-gray-700'}"
							>
								{tag}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Add New Tag -->
			<div class="space-y-2">
				<Label for="newTag" class="text-sm text-gray-600">Add New Tag</Label>
				<div class="flex gap-2">
					<Input
						id="newTag"
						bind:value={newTag}
						placeholder="Enter new tag name"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addNewTag();
							}
						}}
					/>
					<Button
						type="button"
						variant="outline"
						onclick={addNewTag}
						disabled={!newTag.trim()}
					>
						Add
					</Button>
				</div>
			</div>
		</div>

		<!-- Images -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<Label>Product Images</Label>
				<Sheet bind:open={isImageSidebarOpen}>
					<SheetTrigger asChild>
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								isImageSidebarOpen = true;
								loadImages();
							}}
						>
							<Image class="w-4 h-4 mr-2" />
							Select Images
						</Button>
					</SheetTrigger>
					<SheetContent class="w-[600px] sm:w-[800px]">
						<SheetHeader>
							<SheetTitle>Select Images</SheetTitle>
						</SheetHeader>

						<div class="mt-6 space-y-4">
							<!-- Search and Add Button -->
							<div class="flex gap-2">
								<Input
									bind:value={imageSearchQuery}
									placeholder="Search images..."
									class="flex-1"
								/>
								<Button
									type="button"
									onclick={addSelectedImages}
									disabled={selectedImageIds.length === 0}
								>
									Add {selectedImageIds.length} image(s)
								</Button>
							</div>

							<!-- Image Tag Filters -->
							{#if !isLoadingTags && availableTags.length > 0}
								<div class="space-y-2">
									<Label class="text-sm text-gray-600">Filter by Tags</Label>
									<div class="flex flex-wrap gap-2">
										{#each availableTags as tag}
											<button
												type="button"
												onclick={() => {
													if (imageSelectedTags.includes(tag)) {
														imageSelectedTags =
															imageSelectedTags.filter(
																(t) => t !== tag
															);
													} else {
														imageSelectedTags = [
															...imageSelectedTags,
															tag
														];
													}
												}}
												class="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors {imageSelectedTags.includes(
													tag
												)
													? 'bg-blue-50 border-blue-200 text-blue-700'
													: 'bg-white border-gray-200 text-gray-700'}"
											>
												{tag}
											</button>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Images Grid -->
							<div class="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
								{#each filterImages() as image}
									<div class="relative group">
										<button
											type="button"
											onclick={() => toggleImageSelection(image.id)}
											class="w-full aspect-square border rounded-lg overflow-hidden hover:border-blue-300 transition-colors {selectedImageIds.includes(
												image.id
											)
												? 'border-blue-500 bg-blue-50'
												: 'border-gray-200'}"
										>
											<img
												src={image.thumbUrl}
												alt={image.title || image.filename}
												class="w-full h-full object-cover"
											/>
											{#if selectedImageIds.includes(image.id)}
												<div
													class="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center"
												>
													<div
														class="bg-blue-500 text-white rounded-full p-1"
													>
														<Plus class="w-4 h-4" />
													</div>
												</div>
											{/if}
										</button>
										<div class="mt-1 text-xs text-gray-600 truncate">
											{image.title || image.filename}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>

			<!-- Selected Images -->
			{#if selectedImages.length > 0}
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each selectedImages as image, index}
						<div class="relative group">
							<div class="aspect-square border rounded-lg overflow-hidden">
								<img
									src={image.thumbUrl}
									alt={image.filename}
									class="w-full h-full object-cover"
								/>
								<button
									type="button"
									onclick={() => removeImage(image.id)}
									class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<X class="w-3 h-3" />
								</button>
							</div>
							<div class="mt-2 space-y-2">
								<div class="text-xs text-gray-600 truncate">
									{image.filename}
								</div>
								<div class="flex gap-1">
									<button
										type="button"
										onclick={() => setCoverImage(image.id)}
										class="text-xs px-2 py-1 rounded {coverImageId === image.id
											? 'bg-blue-500 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									>
										{coverImageId === image.id ? 'Cover' : 'Set Cover'}
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Active Status -->
		<div class="space-y-2">
			<Label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={isActive} class="rounded border-gray-300" />
				Active Product
			</Label>
		</div>

		{#if error}
			<div class="p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{/if}

		<div class="flex gap-4">
			<Button type="submit" disabled={isSaving}>
				{isSaving ? 'Creating...' : 'Create Product'}
			</Button>
			<Button type="button" variant="outline" onclick={handleCancel} disabled={isSaving}>
				Cancel
			</Button>
		</div>
	</form>
</div>
