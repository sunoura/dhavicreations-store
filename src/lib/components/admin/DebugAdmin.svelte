<script lang="ts">
  import { useAdmin } from "$lib/stores/admin.svelte";

  const { state } = useAdmin();

  // Debug admin state changes
  $effect(() => {
    console.log("Admin state changed:", {
      admin: state.admin,
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
    });
  });

  // Monitor authentication status
  $effect(() => {
    if (state.isAuthenticated) {
      console.log("Admin authenticated:", state.admin?.username);
    } else {
      console.log("Admin not authenticated");
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
          loading: state.loading,
        },
        null,
        2
      )}</pre>
  </div>
{/if}
