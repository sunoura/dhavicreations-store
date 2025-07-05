<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let title = $state('');
	let description = $state('');
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let isUploading = $state(false);
	let error = $state<string | null>(null);

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			// Clean up filename for title
			const cleanTitle = file.name
				.replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
				.replace(/\.[^/.]+$/, '') // Remove file extension
				.replace(/\s+/g, ' ') // Replace multiple spaces with single space
				.trim();

			title = cleanTitle;
			selectedFile = file;
			error = null;

			// Create preview URL
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			previewUrl = URL.createObjectURL(file);
		}
	}

	async function handleSubmit() {
		if (!selectedFile) {
			error = 'Please select an image file';
			toast.error('Please select an image file');
			return;
		}

		if (!title.trim()) {
			error = 'Please enter a title';
			toast.error('Please enter a title');
			return;
		}

		isUploading = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);
			formData.append('title', title.trim());
			if (description.trim()) {
				formData.append('description', description.trim());
			}

			const response = await fetch('/api/images', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Upload failed');
			}

			const result = await response.json();
			console.log('Upload successful:', result);

			toast.success('Image uploaded successfully!');

			// Redirect to images list
			goto('/admin/manage/images');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Upload failed';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Upload error:', err);
		} finally {
			isUploading = false;
		}
	}

	function handleCancel() {
		toast.info('Upload cancelled');
		history.back();
	}

	// Cleanup preview URL when component is destroyed
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});
</script>

<div class="max-w-2xl mx-auto p-6">
	<h1 class="text-2xl font-semibold mb-6">Upload New Image</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-6"
	>
		<div class="space-y-2">
			<Label for="file">Image File</Label>
			<Input
				id="file"
				name="file"
				type="file"
				accept="image/*"
				onchange={handleFileChange}
				required
			/>
		</div>

		{#if previewUrl}
			<div class="space-y-2">
				<Label>Preview</Label>
				<div
					class="h-64 w-full border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center"
				>
					<img
						src={previewUrl}
						alt="Image preview"
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			<Label for="title">Title</Label>
			<Input id="title" name="title" bind:value={title} required />
		</div>

		<div class="space-y-2">
			<Label for="description">Description</Label>
			<Textarea id="description" name="description" bind:value={description} rows={3} />
		</div>

		{#if error}
			<div class="p-3 bg-red-50 border border-red-200 rounded-md">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{/if}

		<div class="flex gap-4">
			<Button type="submit" disabled={isUploading}>
				{isUploading ? 'Uploading...' : 'Upload Image'}
			</Button>
			<Button type="button" variant="outline" onclick={handleCancel} disabled={isUploading}>
				Cancel
			</Button>
		</div>
	</form>
</div>
