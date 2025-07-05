<script lang="ts">
	import AdminProvider from '$lib/components/admin/AdminProvider.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/admin/AdminSidebar.svelte';
	import AdminNavbar from '$lib/components/admin/AdminNavbar.svelte';

	let { children } = $props();
</script>

<AdminProvider>
	<Sidebar.Provider>
		<AppSidebar />
		<!-- <Sidebar.Trigger /> -->
		<main class="w-full px-12">
			<AdminNavbar />
			{@render children()}
		</main>
	</Sidebar.Provider>
</AdminProvider>
