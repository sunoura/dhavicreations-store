<script lang="ts">
	import { useAdmin } from '$lib/stores/admin.svelte';

	const { state } = useAdmin();

	// Debug admin state changes - removed console.log statements
	$effect(() => {
		// Admin state changed
	});

	// Monitor authentication status - removed console.log statements
	$effect(() => {
		if (state.isAuthenticated) {
			// Admin authenticated
		} else {
			// Admin not authenticated
		}
	});
</script>

{#if import.meta.env.DEV}
	<div class="debug-panel bg-gray-100 p-4 rounded text-sm">
		<h3 class="font-bold mb-2">Debug Info (Dev Only)</h3>
		<pre>{JSON.stringify(
				{
					admin: state.admin,
					isAuthenticated: state.isAuthenticated,
					loading: state.loading
				},
				null,
				2
			)}</pre>
	</div>
{/if}
