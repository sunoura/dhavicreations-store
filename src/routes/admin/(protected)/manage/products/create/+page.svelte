<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';

	// Get data from server with fallbacks
	const pageData = page.data;
	const serverCategories = pageData?.categories || [];
	const serverImages = pageData?.images || [];
	const serverTags = pageData?.availableTags || [];

	async function handleSubmit(formData: FormData) {
		const response = await fetch('/api/products', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to create product');
		}

		const result = await response.json();
		// Product created successfully

		toast.success('Product created successfully!');
		goto('/admin/manage/products');
	}

	function handleCancel() {
		toast.info('Product creation cancelled');
		history.back();
	}
</script>

<ProductForm
	mode="create"
	categories={serverCategories}
	availableTags={serverTags}
	allImages={serverImages}
	onSubmit={handleSubmit}
	onCancel={handleCancel}
/>
