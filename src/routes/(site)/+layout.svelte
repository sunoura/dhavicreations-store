<script lang="ts">
	import SiteNavbar from '$lib/components/site/SiteNavbar.svelte';
	import SiteFooter from '$lib/components/site/SiteFooter.svelte';

	let { children } = $props();
</script>

<SiteNavbar />
{@render children()}
<SiteFooter />
