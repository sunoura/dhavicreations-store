<script lang="ts">
	import { page } from '$app/state';
	import { globalState } from '$lib/client/stores/globalState.svelte';
</script>

<div
	class="fixed top-0 right-0 left-0 z-10 flex w-full justify-end gap-4 bg-white px-4 py-2 font-semibold tracking-tight uppercase"
>
	<!-- <a href="/shop" class="nav-link disabled opacity-20">Shop</a> -->
	<a href="/" class:active={page.url.pathname === '/'} class="nav-link">Home</a>
	<a href="/store" class:active={page.url.pathname === '/store'} class="nav-link">Store</a>
	<a href="/custom-orders" class:active={page.url.pathname === '/custom-orders'} class="nav-link"
		>Custom Orders</a
	>
	<a href="/kit" class:active={page.url.pathname === '/kit'} class="nav-link"
		>Fabric Painting Kit</a
	>
	<a href="/about" class:active={page.url.pathname === '/about'} class="nav-link">About Us</a>
	<a href="/admin" class:hidden={!globalState.debug} class="nav-link">Admin</a>
</div>

<style>
	.active {
		text-decoration: underline;
	}
</style>
