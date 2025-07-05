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
	import { toast } from 'svelte-sonner';
	import { Image, Plus, X } from '@lucide/svelte';
	import CategoryForm from './CategoryForm.svelte';

	interface Category {
		id: number;
		name: string;
		slug: string;
		description: string | null;
	}

	interface ProductImage {
		id: number;
		imageUrl: string;
		thumbUrl: string;
		filename: string;
	}

	interface AvailableImage {
		id: number;
		imageUrl: string;
		thumbUrl: string;
		filename: string;
		title?: string | null;
		description?: string | null;
		tags?: string[];
	}

	interface Props {
		mode: 'create' | 'edit';
		initialData?: {
			id?: number;
			title: string;
			slug: string;
			categoryId: string | undefined;
			description: string;
			price: string;
			sku: string;
			stock: string;
			isActive: boolean;
			selectedTags: string[];
			selectedImages: ProductImage[];
			coverImageId: number | null;
		};
		categories: Category[];
		availableTags: string[];
		allImages: AvailableImage[];
		onSubmit: (formData: FormData) => Promise<void>;
		onCancel: () => void;
		isLoading?: boolean;
	}

	let {
		mode,
		initialData,
		categories,
		availableTags,
		allImages,
		onSubmit,
		onCancel,
		isLoading = false
	}: Props = $props();

	// Form state
	let title = $state(initialData?.title || '');
	let slug = $state(initialData?.slug || '');
	let categoryId = $state<string | undefined>(initialData?.categoryId || undefined);
	let description = $state(initialData?.description || '');
	let price = $state(initialData?.price || '');
	let sku = $state(initialData?.sku || '');
	let stock = $state(initialData?.stock || '0');
	let isActive = $state(initialData?.isActive ?? true);
	let selectedTags = $state<string[]>(initialData?.selectedTags || []);
	let selectedImages = $state<ProductImage[]>(initialData?.selectedImages || []);
	let coverImageId = $state<number | null>(initialData?.coverImageId || null);

	// UI state
	let newTag = $state('');
	let showCategoryForm = $state(false);
	let isImageSidebarOpen = $state(false);
	let imageSearchQuery = $state('');
	let imageSelectedTags = $state<string[]>([]);
	let selectedImageIds = $state<number[]>([]);
	let error = $state<string | null>(null);

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

	function handleCategoryCreated(newCategory: Category) {
		categories = [newCategory, ...categories];
		categoryId = newCategory.id.toString();
		showCategoryForm = false;
	}

	function showNewCategoryForm() {
		showCategoryForm = true;
	}

	function toggleImageSelection(imageId: number) {
		if (selectedImageIds.includes(imageId)) {
			selectedImageIds = selectedImageIds.filter((id) => id !== imageId);
		} else {
			selectedImageIds = [...selectedImageIds, imageId];
		}
	}

	function addSelectedImages() {
		const imagesToAdd = allImages.filter((img: { id: number }) =>
			selectedImageIds.includes(img.id)
		);
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
				(image: { title?: string | null; filename: string; description?: string | null }) =>
					image.title?.toLowerCase().includes(query) ||
					image.filename.toLowerCase().includes(query) ||
					image.description?.toLowerCase().includes(query)
			);
		}

		// Filter by selected tags
		if (imageSelectedTags.length > 0) {
			filtered = filtered.filter(
				(image: { tags?: string[] }) =>
					image.tags && imageSelectedTags.some((tag) => image.tags!.includes(tag))
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

		if (!price || price.toString().trim() === '') {
			error = 'Price is required';
			toast.error('Price is required');
			return;
		}

		if (!sku.trim()) {
			error = 'SKU is required';
			toast.error('SKU is required');
			return;
		}

		error = null;

		try {
			const formData = new FormData();
			formData.append('title', title.trim());
			formData.append('slug', slug.trim());
			formData.append('categoryId', categoryId!);
			if (description.trim()) {
				formData.append('description', description.trim());
			}
			formData.append('price', price.toString().trim());
			formData.append('sku', sku.trim());
			formData.append('stock', stock.toString().trim());
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

			await onSubmit(formData);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error saving product:', err);
		}
	}
</script>

<div class="max-w-4xl mx-auto p-6">
	<h1 class="text-2xl font-semibold mb-6">
		{mode === 'create' ? 'Create New Product' : 'Edit Product'}
	</h1>

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
				{#if categories.length > 0}
					<div class="flex gap-2">
						<Select.Root type="single" bind:value={categoryId}>
							<Select.Trigger class="w-full">
								{categoryId
									? categories.find(
											(c: { id: number; name: string }) =>
												c.id.toString() === categoryId
										)?.name
									: 'Select a category'}
							</Select.Trigger>
							<Select.Content>
								{#each categories as category}
									<Select.Item
										value={category.id.toString()}
										label={category.name}
									>
										{category.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Button
							type="button"
							variant="outline"
							onclick={showNewCategoryForm}
							class="whitespace-nowrap"
						>
							New
						</Button>
					</div>
				{:else}
					<div
						class="w-full h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500"
					>
						No categories available
					</div>
				{/if}

				<!-- Add New Category Form -->
				{#if showCategoryForm}
					<CategoryForm
						{categories}
						onCategoryCreated={handleCategoryCreated}
						onCancel={() => (showCategoryForm = false)}
					/>
				{/if}
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
			{#if availableTags.length > 0}
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
					<SheetTrigger>
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								isImageSidebarOpen = true;
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
							{#if availableTags.length > 0}
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
			<Button type="submit" disabled={isLoading}>
				{isLoading
					? mode === 'create'
						? 'Creating...'
						: 'Updating...'
					: mode === 'create'
						? 'Create Product'
						: 'Update Product'}
			</Button>
			<Button type="button" variant="outline" onclick={onCancel} disabled={isLoading}>
				Cancel
			</Button>
		</div>
	</form>
</div>
