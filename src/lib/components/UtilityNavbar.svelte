<script lang="ts">
  import ThemeToggle from "./ThemeToggle.svelte";
  import { page } from "$app/state";

  $effect(() => {
    $inspect(page.url.pathname);
  });
</script>

<div class="utility-navbar">
  <div class="wrapper flex items-center justify-end gap-4">
    <div class="navbar-link">
      <a href="/" class:active={page.url.pathname === "/"}>Site</a>
    </div>
    <div class="navbar-link">
      <a href="/admin" class:active={page.url.pathname === "/admin"}>Admin</a>
    </div>

    <ThemeToggle />
  </div>
</div>

<style>
  .utility-navbar {
    position: relative;
    padding: 10px 15px;
  }

  .navbar-link .active {
    text-decoration: underline;
  }
</style>
