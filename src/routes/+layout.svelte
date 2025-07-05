<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import UtilityNavbar from '$lib/components/UtilityNavbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<ModeWatcher />
<div class="page-wrapper">
	<UtilityNavbar />
	{@render children()}
</div>
<Toaster />
