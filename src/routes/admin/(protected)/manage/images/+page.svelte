<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { Pencil, Copy } from '@lucide/svelte';

	let images = $state<
		Array<{
			id: number;
			imageUrl: string;
			thumbUrl: string;
			filename: string;
			title: string | null;
			description: string | null;
			size: number;
			createdAt: string;
			updatedAt: string;
		}>
	>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	async function loadImages() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/images');
			if (!response.ok) {
				throw new Error('Failed to load images');
			}

			images = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load images';
			console.error('Error loading images:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleCreateNew() {
		goto('/admin/manage/images/create');
	}

	async function copyImageUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			// You could add a toast notification here
			console.log('Image URL copied to clipboard');
		} catch (err) {
			console.error('Failed to copy URL:', err);
		}
	}

	// Load images on component mount
	$effect(() => {
		loadImages();
	});
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-semibold">Images</h1>
		<Button onclick={handleCreateNew}>Upload New Image</Button>
	</div>

	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div class="text-gray-500">Loading images...</div>
		</div>
	{:else if error}
		<div class="flex justify-center items-center h-64">
			<div class="text-red-500">Error: {error}</div>
		</div>
	{:else if images.length === 0}
		<div class="flex flex-col items-center justify-center h-64 text-gray-500">
			<div class="text-lg mb-2">No images yet</div>
			<div class="text-sm mb-4">Upload your first image to get started</div>
			<Button onclick={handleCreateNew}>Upload Image</Button>
		</div>
	{:else}
		<div class="grid grid-cols-6 gap-2">
			{#each images as image}
				<div
					class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden mx-auto"
				>
					<img
						src={image.thumbUrl}
						alt={image.title || image.filename}
						class="w-full h-full object-cover"
						loading="lazy"
					/>
					<div
						class="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"
					></div>
					<div
						class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
					>
						<div class="flex gap-3">
							<button
								class="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
								onclick={() => copyImageUrl(image.imageUrl)}
								title="Copy image URL"
							>
								<Copy class="w-4 h-4 text-white" />
							</button>
							<button
								class="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
								onclick={() => goto(`/admin/manage/images/${image.id}/edit`)}
								title="Edit image"
							>
								<Pencil class="w-4 h-4 text-white" />
							</button>
						</div>
					</div>
					<div
						class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
					>
						<div class="text-white text-xs truncate">
							{image.title || image.filename}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
