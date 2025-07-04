<script lang="ts">
  import { goto } from "$app/navigation";
  import { useAdmin } from "$lib/stores/admin.svelte";

  const { state, actions } = useAdmin();

  async function handleLogout() {
    actions.setLoading(true);
    try {
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        actions.logout();
        goto("/admin/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      actions.setLoading(false);
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Admin Dashboard</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">
          Welcome, {state.admin?.firstName || state.admin?.username || "Admin"}
        </span>
        <button
          onclick={handleLogout}
          disabled={state.loading}
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {state.loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Products</h3>
        <p class="text-gray-600 mb-4">Manage your product catalog</p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Manage Products
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Categories</h3>
        <p class="text-gray-600 mb-4">Organize your products</p>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Manage Categories
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Orders</h3>
        <p class="text-gray-600 mb-4">View and manage orders</p>
        <button
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          View Orders
        </button>
      </div>
    </div>

    <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-semibold mb-4">Quick Stats</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">0</div>
          <div class="text-sm text-gray-600">Total Products</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">0</div>
          <div class="text-sm text-gray-600">Categories</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">0</div>
          <div class="text-sm text-gray-600">Orders</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">0</div>
          <div class="text-sm text-gray-600">Revenue</div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
</style>
