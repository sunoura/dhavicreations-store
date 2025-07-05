<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	interface Category {
		id: number;
		name: string;
		slug: string;
		description: string | null;
	}

	interface Props {
		categories: Category[];
		onCategoryCreated: (newCategory: Category) => void;
		onCancel?: () => void;
	}

	let { categories, onCategoryCreated, onCancel }: Props = $props();

	let newCategoryName = $state('');
	let newCategoryDescription = $state('');
	let isCreatingCategory = $state(false);

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

			// Clear form
			newCategoryName = '';
			newCategoryDescription = '';

			// Notify parent component
			onCategoryCreated(newCategory);

			toast.success('Category created successfully!');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
			toast.error(errorMessage);
			console.error('Error creating category:', err);
		} finally {
			isCreatingCategory = false;
		}
	}

	function handleCancel() {
		newCategoryName = '';
		newCategoryDescription = '';
		onCancel?.();
	}
</script>

<div class="space-y-4 p-4 border rounded-lg bg-gray-50">
	<Label class="text-sm text-gray-600">Add New Category</Label>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
	<div class="flex gap-2">
		<Button
			type="button"
			variant="outline"
			onclick={createCategory}
			disabled={!newCategoryName.trim() || isCreatingCategory}
			class="flex-1"
		>
			{isCreatingCategory ? 'Creating...' : 'Add Category'}
		</Button>
		<Button
			type="button"
			variant="outline"
			onclick={handleCancel}
			disabled={isCreatingCategory}
		>
			Cancel
		</Button>
	</div>
</div>
