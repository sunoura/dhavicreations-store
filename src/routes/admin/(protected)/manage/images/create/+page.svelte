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
			if (selectedTags.length > 0) {
				formData.append('tags', selectedTags.join(','));
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

	// Load available tags on component mount
	$effect(() => {
		loadAvailableTags();
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
