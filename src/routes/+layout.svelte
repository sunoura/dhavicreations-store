<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import UtilityNavbar from "$lib/components/UtilityNavbar.svelte";

  let { children } = $props();
</script>

<ModeWatcher />
<div class="page-wrapper">
  <UtilityNavbar />
  {@render children()}
</div>
