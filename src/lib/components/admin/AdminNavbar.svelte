<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { useAdmin } from '$lib/stores/admin.svelte';

	const { state, actions } = useAdmin();

	async function handleLogout() {
		actions.setLoading(true);
		try {
			const response = await fetch('/api/auth/admin/logout', {
				method: 'POST'
			});

			if (response.ok) {
				actions.logout();
				goto('/admin/login');
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			actions.setLoading(false);
		}
	}
</script>

<div class="admin-navbar">
	<div class="flex justify-between">
		<span class="text-sm text-gray-600">
		</span>
		<div class="wrapper flex items-center justify-end gap-4">
			<div class="navbar-link">
				<a href="/" class:active={page.url.pathname === '/'}>Site</a>
			</div>
			<div class="navbar-link">
				<a href="/admin" class:active={page.url.pathname === '/admin/dashboard'}>Admin</a>
			</div>
			<div class="navbar-link">
				<button onclick={handleLogout} disabled={state.loading}>
					{state.loading ? 'Logging out...' : 'Logout'}
				</button>
			</div>

			<ThemeToggle />
		</div>
	</div>
</div>

<style>
	.admin-navbar {
		position: relative;
		padding: 10px 15px;
	}

	.navbar-link .active {
		text-decoration: underline;
	}
</style>
