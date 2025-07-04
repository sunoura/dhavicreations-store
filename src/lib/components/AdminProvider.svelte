<script lang="ts">
    import { createAdminState, setAdminContext } from "$lib/stores/admin.svelte";
  import { page } from "$app/stores";

  // Create admin state
  const adminState = createAdminState();
  
  // Set context for child components
  setAdminContext(adminState);

  // Sync admin data from page data
  $effect(() => {
    if ($page.data.admin) {
      adminState.actions.setAdmin($page.data.admin);
    } else {
      adminState.actions.setAdmin(null);
    }
  });
</script>

<slot />
