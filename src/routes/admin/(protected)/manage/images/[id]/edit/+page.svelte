<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let image = $state<{
		id: number;
		imageUrl: string;
		thumbUrl: string;
		filename: string;
		title: string | null;
		description: string | null;
		size: number;
		createdAt: string;
		updatedAt: string;
		tags?: string[];
	} | null>(null);

	let title = $state('');
	let description = $state('');
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isLoading = $state(true);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let error = $state<string | null>(null);
	let availableTags = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let newTag = $state('');
	let isLoadingTags = $state(true);

	async function loadAvailableTags() {
		try {
			isLoadingTags = true;
			const response = await fetch('/api/images/tags');
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

	async function loadImage() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch(`/api/images/${page.params.id}`);
			if (!response.ok) {
				throw new Error('Failed to load image');
			}

			const imageData = await response.json();
			image = imageData;
			title = imageData.title || '';
			description = imageData.description || '';
			selectedTags = imageData.tags || [];
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load image';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error loading image:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			selectedFile = file;
			error = null;

			// Create preview URL
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			previewUrl = URL.createObjectURL(file);
		}
	}

	async function handleSave() {
		if (!image) return;

		isSaving = true;
		error = null;

		try {
			const updateData: any = {
				title: title.trim() || null,
				description: description.trim() || null,
				tags: selectedTags
			};

			// If a new file is selected, we need to handle file upload
			if (selectedFile) {
				const formData = new FormData();
				formData.append('file', selectedFile);
				formData.append('title', title.trim());
				if (description.trim()) {
					formData.append('description', description.trim());
				}
				if (selectedTags.length > 0) {
					formData.append('tags', selectedTags.join(','));
				}

				const response = await fetch(`/api/images/${image.id}`, {
					method: 'PUT',
					body: formData
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update image');
				}
			} else {
				// Just update metadata
				const response = await fetch(`/api/images/${image.id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(updateData)
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update image');
				}
			}

			// Reload the image data
			toast.success('Image updated successfully!');
			goto('/admin/manage/images');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to update image';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error updating image:', err);
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!image) {
			toast.error('No image to delete');
			return;
		}

		if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
			toast.info('Delete cancelled');
			return;
		}

		isDeleting = true;
		error = null;

		try {
			const response = await fetch(`/api/images/${image.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete image');
			}

			toast.success('Image deleted successfully!');
			// Redirect back to images list
			goto('/admin/manage/images');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error deleting image:', err);
		} finally {
			isDeleting = false;
		}
	}

	function handleCancel() {
		toast.info('Changes discarded');
		goto('/admin/manage/images');
	}

	onMount(() => {
		loadImage();
		loadAvailableTags();

		// Cleanup preview URL when component is destroyed
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-semibold">Edit Image</h1>
		<Button
			variant="outline"
			onclick={() => {
				toast.info('Returning to images list');
				handleCancel();
			}}>Back to Images</Button
		>
	</div>

	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div class="text-gray-500">Loading image...</div>
		</div>
	{:else if error}
		<div class="flex justify-center items-center h-64">
			<div class="text-red-500">Error: {error}</div>
		</div>
	{:else if image}
		<div class="space-y-6">
			<!-- Current Image Preview -->
			<div class="space-y-2">
				<Label>Current Image</Label>
				<div
					class="h-64 w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center"
				>
					<img
						src={image.imageUrl}
						alt={image.title || image.filename}
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			</div>

			<!-- New Image Upload -->
			<div class="space-y-2">
				<Label for="file">Replace Image (Optional)</Label>
				<Input
					id="file"
					name="file"
					type="file"
					accept="image/*"
					onchange={handleFileChange}
				/>
			</div>

			{#if previewUrl}
				<div class="space-y-2">
					<Label>New Image Preview</Label>
					<div
						class="h-64 w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center"
					>
						<img
							src={previewUrl}
							alt="New image preview"
							class="max-h-full max-w-full object-contain"
						/>
					</div>
				</div>
			{/if}

			<!-- Image Details -->
			<div class="space-y-2">
				<Label for="title">Title</Label>
				<Input id="title" name="title" bind:value={title} />
			</div>

			<div class="space-y-2">
				<Label for="description">Description</Label>
				<Textarea id="description" name="description" bind:value={description} rows={3} />
			</div>

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

			<!-- Image Info -->
			<div class="space-y-2">
				<Label>Image Information</Label>
				<div class="text-sm text-gray-600 space-y-1">
					<div>Filename: {image.filename}</div>
					<div>Size: {(image.size / 1024 / 1024).toFixed(2)} MB</div>
					<div>Uploaded: {new Date(image.createdAt).toLocaleDateString()}</div>
				</div>
			</div>

			{#if error}
				<div class="p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{error}</p>
				</div>
			{/if}

			<div class="flex gap-4">
				<Button onclick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button variant="outline" onclick={handleCancel} disabled={isSaving || isDeleting}>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onclick={handleDelete}
					disabled={isSaving || isDeleting}
				>
					{isDeleting ? 'Deleting...' : 'Delete Image'}
				</Button>
			</div>
		</div>
	{/if}
</div>
