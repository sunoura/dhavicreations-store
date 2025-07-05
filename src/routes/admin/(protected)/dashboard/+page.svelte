<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAdmin } from '$lib/stores/admin.svelte';

	const { state, actions } = useAdmin();
</script>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="mb-8">
			<h1 class="text-3xl font-semibold tracking-tight">
				Welcome, {state.admin?.firstName || state.admin?.username || 'Admin'}
			</h1>
		</div>

		<div>
			<ul class="list-inside text-xl">
				<li>
					<a class="text-blue-400 underline" href="/admin/manage/images/create"
						>Upload a new Image</a
					>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
</style>
