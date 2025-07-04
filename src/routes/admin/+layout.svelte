<script lang="ts">
	import AdminProvider from '$lib/components/AdminProvider.svelte';

	let { children } = $props();
</script>

<AdminProvider>
	{@render children()}
</AdminProvider>
