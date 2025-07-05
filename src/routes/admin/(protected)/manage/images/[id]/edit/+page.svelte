<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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

	async function loadImage() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch(`/api/images/${$page.params.id}`);
			if (!response.ok) {
				throw new Error('Failed to load image');
			}

			image = await response.json();
			title = image.title || '';
			description = image.description || '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load image';
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
				description: description.trim() || null
			};

			// If a new file is selected, we need to handle file upload
			if (selectedFile) {
				const formData = new FormData();
				formData.append('file', selectedFile);
				formData.append('title', title.trim());
				if (description.trim()) {
					formData.append('description', description.trim());
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
			await loadImage();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update image';
			console.error('Error updating image:', err);
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (
			!image ||
			!confirm('Are you sure you want to delete this image? This action cannot be undone.')
		) {
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

			// Redirect back to images list
			goto('/admin/manage/images');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete image';
			console.error('Error deleting image:', err);
		} finally {
			isDeleting = false;
		}
	}

	function handleCancel() {
		goto('/admin/manage/images');
	}

	// Cleanup preview URL when component is destroyed
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	// Load image on component mount
	$effect(() => {
		loadImage();
	});
</script>

<div class="max-w-2xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-semibold">Edit Image</h1>
		<Button variant="outline" onclick={handleCancel}>Back to Images</Button>
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
