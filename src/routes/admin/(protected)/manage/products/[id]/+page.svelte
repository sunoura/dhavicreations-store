<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';

	// Get data from server with fallbacks
	const pageData = page.data;
	const serverProduct = pageData?.product;
	const serverCategories = pageData?.categories || [];
	const serverImages = pageData?.images || [];
	const serverTags = pageData?.availableTags || [];

	async function handleSubmit(formData: FormData) {
		const response = await fetch(`/api/products/${page.params.id}`, {
			method: 'PUT',
			body: formData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to update product');
		}

		const result = await response.json();
		console.log('Product updated successfully:', result);

		toast.success('Product updated successfully!');
		goto('/admin/manage/products');
	}

	function handleCancel() {
		toast.info('Product update cancelled');
		history.back();
	}

	// Prepare initial data for ProductForm
	$: initialData = serverProduct
		? {
				id: serverProduct.id,
				title: serverProduct.title,
				slug: serverProduct.slug,
				categoryId: serverProduct.categoryId.toString(),
				description: serverProduct.description || '',
				price: serverProduct.price.toString(),
				sku: serverProduct.sku,
				stock: serverProduct.stock.toString(),
				isActive: serverProduct.isActive,
				selectedTags: serverProduct.tags || [],
				selectedImages: serverProduct.images || [],
				coverImageId: serverProduct.coverImageId
			}
		: undefined;
</script>

<ProductForm
	mode="edit"
	{initialData}
	categories={serverCategories}
	availableTags={serverTags}
	allImages={serverImages}
	onSubmit={handleSubmit}
	onCancel={handleCancel}
/>
