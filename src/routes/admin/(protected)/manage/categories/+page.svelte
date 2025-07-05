<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';

	let categories = $state<
		Array<{
			id: number;
			name: string;
			slug: string;
			description: string | null;
			productCount: number;
		}>
	>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');

	// Form state for creating/editing
	let isFormOpen = $state(false);
	let isEditing = $state(false);
	let editingId = $state<number | null>(null);
	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let isSaving = $state(false);

	async function loadCategories() {
		try {
			isLoading = true;
			const response = await fetch('/api/categories');
			if (!response.ok) {
				throw new Error('Failed to load categories');
			}
			categories = await response.json();
		} catch (err) {
			console.error('Error loading categories:', err);
			error = 'Failed to load categories';
		} finally {
			isLoading = false;
		}
	}

	function generateSlug() {
		slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	function openCreateForm() {
		isFormOpen = true;
		isEditing = false;
		editingId = null;
		name = '';
		slug = '';
		description = '';
	}

	function openEditForm(category: any) {
		isFormOpen = true;
		isEditing = true;
		editingId = category.id;
		name = category.name;
		slug = category.slug;
		description = category.description || '';
	}

	function closeForm() {
		isFormOpen = false;
		isEditing = false;
		editingId = null;
		name = '';
		slug = '';
		description = '';
	}

	async function handleSubmit() {
		if (!name.trim()) {
			toast.error('Name is required');
			return;
		}

		if (!slug.trim()) {
			toast.error('Slug is required');
			return;
		}

		isSaving = true;

		try {
			const formData = new FormData();
			formData.append('name', name.trim());
			formData.append('slug', slug.trim());
			if (description.trim()) {
				formData.append('description', description.trim());
			}

			const url = isEditing ? `/api/categories/${editingId}` : '/api/categories';
			const method = isEditing ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				body: formData
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || `Failed to ${isEditing ? 'update' : 'create'} category`
				);
			}

			toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
			closeForm();
			loadCategories();
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: `Failed to ${isEditing ? 'update' : 'create'} category`;
			toast.error(errorMessage);
			console.error('Error saving category:', err);
		} finally {
			isSaving = false;
		}
	}

	async function deleteCategory(id: number, name: string) {
		if (
			!confirm(
				`Are you sure you want to delete the category "${name}"? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete category');
			}

			toast.success('Category deleted successfully!');
			loadCategories();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
			toast.error(errorMessage);
			console.error('Error deleting category:', err);
		}
	}

	function filterCategories() {
		if (!searchQuery.trim()) {
			return categories;
		}

		const query = searchQuery.toLowerCase();
		return categories.filter(
			(category) =>
				category.name.toLowerCase().includes(query) ||
				category.slug.toLowerCase().includes(query) ||
				(category.description && category.description.toLowerCase().includes(query))
		);
	}

	// Load categories on component mount
	$effect(() => {
		loadCategories();
	});
</script>

<div class="p-6">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-semibold">Categories</h1>
		<Button onclick={openCreateForm}>
			<Plus class="w-4 h-4 mr-2" />
			Add Category
		</Button>
	</div>

	<!-- Search -->
	<div class="mb-6">
		<Input
			id="search"
			bind:value={searchQuery}
			placeholder="Search categories..."
			class="max-w-md"
		/>
	</div>

	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div class="text-gray-500">Loading categories...</div>
		</div>
	{:else if error}
		<div class="flex justify-center items-center h-64">
			<div class="text-red-500">Error: {error}</div>
		</div>
	{:else if filterCategories().length === 0}
		<div class="flex flex-col items-center justify-center h-64 text-gray-500">
			<div class="text-lg mb-2">No categories yet</div>
			<div class="text-sm mb-4">Create your first category to get started</div>
			<Button onclick={openCreateForm}>Add Category</Button>
		</div>
	{:else}
		<div class="bg-white rounded-lg border overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50 border-b">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Name
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Slug
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Description
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Products
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filterCategories() as category}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{category.name}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{category.slug}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500">
								<div class="max-w-xs truncate">
									{category.description || '-'}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								<span
									class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
								>
									{category.productCount}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<div class="flex gap-2">
									<button
										class="text-blue-600 hover:text-blue-900"
										onclick={() => openEditForm(category)}
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										class="text-red-600 hover:text-red-900"
										onclick={() => deleteCategory(category.id, category.name)}
									>
										<Trash2 class="w-4 h-4" />
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

<!-- Modal Form -->
{#if isFormOpen}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
			<h2 class="text-xl font-semibold mb-4">
				{isEditing ? 'Edit Category' : 'Add Category'}
			</h2>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<Label for="name">Name *</Label>
					<Input id="name" bind:value={name} oninput={generateSlug} required />
				</div>

				<div class="space-y-2">
					<Label for="slug">Slug *</Label>
					<Input id="slug" bind:value={slug} required />
				</div>

				<div class="space-y-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						bind:value={description}
						rows={3}
						placeholder="Category description..."
					/>
				</div>

				<div class="flex gap-3 pt-4">
					<Button type="submit" disabled={isSaving} class="flex-1">
						{isSaving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
					</Button>
					<Button
						type="button"
						variant="outline"
						onclick={closeForm}
						disabled={isSaving}
						class="flex-1"
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
