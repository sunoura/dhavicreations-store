<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';
	import { Pencil, Copy, Archive } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let products = $state<
		Array<{
			id: number;
			title: string;
			slug: string;
			categoryId: number;
			description: string | null;
			price: number;
			sku: string;
			stock: number;
			coverImageId: number | null;
			isActive: boolean;
			archivedAt: string | null;
			createdAt: string;
			updatedAt: string;
			category: {
				id: number;
				name: string;
				slug: string;
			};
			tags: string[];
			images: Array<{
				id: number;
				imageUrl: string;
				thumbUrl: string;
				filename: string;
				sortOrder: number;
			}>;
		}>
	>([]);
	let allProducts = $state<typeof products>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let availableTags = $state<string[]>([]);
	let selectedTagFilters = $state<string[]>([]);
	let isLoadingTags = $state(true);

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

	function toggleTagFilter(tag: string) {
		if (selectedTagFilters.includes(tag)) {
			selectedTagFilters = selectedTagFilters.filter((t) => t !== tag);
		} else {
			selectedTagFilters = [...selectedTagFilters, tag];
		}
	}

	function filterProducts() {
		let filtered = allProducts;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(product) =>
					product.title.toLowerCase().includes(query) ||
					product.sku.toLowerCase().includes(query) ||
					product.description?.toLowerCase().includes(query) ||
					product.category.name.toLowerCase().includes(query)
			);
		}

		// Filter by selected tags
		if (selectedTagFilters.length > 0) {
			filtered = filtered.filter(
				(product) =>
					product.tags && selectedTagFilters.some((tag) => product.tags!.includes(tag))
			);
		}

		products = filtered;
	}

	async function loadProducts() {
		try {
			isLoading = true;
			error = null;

			const response = await fetch('/api/products');
			if (!response.ok) {
				throw new Error('Failed to load products');
			}

			allProducts = await response.json();
			products = allProducts;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
			error = errorMessage;
			toast.error(errorMessage);
			console.error('Error loading products:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleCreateNew() {
		goto('/admin/manage/products/create');
	}

	async function archiveProduct(productId: number, productTitle: string) {
		if (!confirm(`Are you sure you want to archive "${productTitle}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to archive product');
			}

			toast.success('Product archived successfully!');
			await loadProducts(); // Reload the list
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to archive product';
			toast.error(errorMessage);
			console.error('Error archiving product:', err);
		}
	}

	function formatPrice(priceInPaise: number): string {
		const rupees = priceInPaise / 100;
		return `₹${rupees.toFixed(2)}`;
	}

	onMount(() => {
		loadProducts();
		loadAvailableTags();
	});

	// Filter products when search query or tag filters change
	$effect(() => {
		if (allProducts.length > 0) {
			filterProducts();
		}
	});
</script>

<div class="p-6">
	<!-- Search and Upload -->
	<div class="flex gap-3 items-center mb-3">
		<Input
			id="search"
			bind:value={searchQuery}
			placeholder="Search products by title, SKU, description, or category..."
			class="flex-1"
		/>
		<Button onclick={handleCreateNew}>Create New Product</Button>
	</div>

	<!-- Tag Filters -->
	<div class="mb-6 space-y-4">
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
				<span>Showing {products.length} of {allProducts.length} products</span>
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
			<div class="text-gray-500">Loading products...</div>
		</div>
	{:else if error}
		<div class="flex justify-center items-center h-64">
			<div class="text-red-500">Error: {error}</div>
		</div>
	{:else if products.length === 0}
		<div class="flex flex-col items-center justify-center h-64 text-gray-500">
			<div class="text-lg mb-2">No products yet</div>
			<div class="text-sm mb-4">Create your first product to get started</div>
			<Button onclick={handleCreateNew}>Create Product</Button>
		</div>
	{:else}
		<div class="bg-white rounded-lg border overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50 border-b">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Product</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Category</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Price</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Stock</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>SKU</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Status</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each products as product}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									{#if product.images.length > 0}
										{@const coverImage = product.coverImageId
											? product.images.find(
													(img) => img.id === product.coverImageId
												)
											: product.images[0]}
										<img
											src={coverImage?.thumbUrl || product.images[0].thumbUrl}
											alt={product.title}
											class="h-10 w-10 rounded object-cover mr-3"
										/>
									{:else}
										<div
											class="h-10 w-10 rounded bg-gray-200 mr-3 flex items-center justify-center"
										>
											<span class="text-gray-400 text-xs">No img</span>
										</div>
									{/if}
									<div>
										<div class="text-sm font-medium text-gray-900">
											{product.title}
										</div>
										<div class="text-sm text-gray-500">{product.slug}</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{product.category.name}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{formatPrice(product.price)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {product.stock >
									0
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}"
								>
									{product.stock}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{product.sku}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {product.isActive
										? 'bg-green-100 text-green-800'
										: 'bg-gray-100 text-gray-800'}"
								>
									{product.isActive ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<div class="flex gap-2">
									<button
										class="text-blue-600 hover:text-blue-900"
										onclick={() => goto(`/admin/manage/products/${product.id}`)}
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										class="text-red-600 hover:text-red-900"
										onclick={() => archiveProduct(product.id, product.title)}
									>
										<Archive class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
