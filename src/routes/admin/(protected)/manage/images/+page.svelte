<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { Pencil, Copy } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';

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
			tags?: string[];
		}>
	>([]);
	let allImages = $state<typeof images>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let availableTags = $state<string[]>([]);
	let selectedTagFilters = $state<string[]>([]);
	let isLoadingTags = $state(true);

	async function loadImages() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/images');
			if (!response.ok) {
				throw new Error('Failed to load images');
			}

			allImages = await response.json();
			images = allImages;
			console.log('Images loaded:', allImages.length);
			console.log('Sample image with tags:', allImages[0]);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load images';
			error = errorMessage;
			toast.error(errorMessage);
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
			toast.success('Image URL copied to clipboard');
		} catch (err) {
			toast.error('Failed to copy URL to clipboard');
			console.error('Failed to copy URL:', err);
		}
	}

	async function loadAvailableTags() {
		try {
			isLoadingTags = true;
			const response = await fetch('/api/images/tags');
			if (!response.ok) {
				throw new Error('Failed to load tags');
			}
			availableTags = await response.json();
			console.log('Available tags loaded:', availableTags);
		} catch (err) {
			console.error('Error loading tags:', err);
		} finally {
			isLoadingTags = false;
		}
	}

	function toggleTagFilter(tag: string) {
		if (selectedTagFilters.includes(tag)) {
			selectedTagFilters = selectedTagFilters.filter((t) => t !== tag);
		} else {
			selectedTagFilters = [...selectedTagFilters, tag];
		}
	}

	function filterImages() {
		let filtered = allImages;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(image) =>
					image.title?.toLowerCase().includes(query) ||
					image.filename.toLowerCase().includes(query) ||
					image.description?.toLowerCase().includes(query)
			);
		}

		// Filter by selected tags
		if (selectedTagFilters.length > 0) {
			console.log('Filtering by tags:', selectedTagFilters);
			console.log('Images before tag filter:', filtered.length);
			filtered = filtered.filter(
				(image) => image.tags && selectedTagFilters.some((tag) => image.tags!.includes(tag))
			);
			console.log('Images after tag filter:', filtered.length);
			console.log('Sample image tags:', filtered[0]?.tags);
		}

		images = filtered;
	}

	onMount(() => {
		loadImages();
		loadAvailableTags();
	});

	// Filter images when search query or tag filters change
	$effect(() => {
		if (allImages.length > 0) {
			filterImages();
		}
	});
</script>

<div class="p-6">
	<!-- Search and Upload -->
	<div class="flex gap-3 items-center mb-3">
		<Input
			id="search"
			bind:value={searchQuery}
			placeholder="Search by title, filename, or description..."
			class="flex-1"
		/>
		<Button onclick={handleCreateNew}>Upload New Image</Button>
	</div>

	<!-- Search and Filters -->
	<div class="mb-6 space-y-4">
		<!-- Tag Filters -->
		{#if !isLoadingTags && availableTags.length > 0}
			<div class="space-y-2">
				<div class="flex flex-wrap gap-2">
					{#each availableTags as tag}
						<button
							type="button"
							onclick={() => toggleTagFilter(tag)}
							class="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors {selectedTagFilters.includes(
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

		<!-- Active Filters Summary -->
		{#if searchQuery.trim() || selectedTagFilters.length > 0}
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<span>Showing {images.length} of {allImages.length} images</span>
				{#if searchQuery.trim() || selectedTagFilters.length > 0}
					<button
						type="button"
						onclick={() => {
							searchQuery = '';
							selectedTagFilters = [];
						}}
						class="text-blue-600 hover:text-blue-800 underline"
					>
						Clear filters
					</button>
				{/if}
			</div>
		{/if}
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
