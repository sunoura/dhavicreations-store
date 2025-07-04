<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();

		if (!username || !password) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (response.ok) {
				// Get redirect URL from query params, or use default dashboard
				const redirectTo = page.url.searchParams.get('redirectTo');

				if (redirectTo) {
					// If there was a specific redirect URL, go there
					goto(redirectTo);
				} else {
					// Default to admin dashboard
					goto('/admin/dashboard');
				}
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="form-wrapper py-20">
	<form class="flex flex-col gap-2 py-10" onsubmit={handleLogin}>
		<h2 class="text-3xl font-semibold tracking-tight mb-4 text-center">Welcome back!</h2>

		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}

		<div class="form-item">
			<label for="username">Username</label>
			<input
				type="text"
				name="username"
				id="username"
				placeholder="Username"
				value={username}
				oninput={(e) => (username = e.currentTarget.value)}
				required
				disabled={loading}
			/>
		</div>
		<div class="form-item">
			<label for="password">Password</label>
			<input
				type="password"
				name="password"
				id="password"
				placeholder="Password"
				value={password}
				oninput={(e) => (password = e.currentTarget.value)}
				required
				disabled={loading}
			/>
		</div>
		<div class="flex justify-end">
			<a href="#" class="underline">Forgot Password?</a>
		</div>
		<div class="mt-2"></div>
		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</button>
	</form>

	<hr />
	<div class="text-center mt-4">
		<p class="text-xl font-medium tracking-tight">Don't have an account?</p>
		<a href="/user/signup" class="underline">Sign up</a>
	</div>
</div>

<style>
	input {
		width: 100%;
		padding: 0.3rem 0.5rem;
		border: 1px solid black;
	}

	button {
		width: 100%;
		padding: 0.4rem;
		background-color: #000;
		color: #fff;
		border: none;
		cursor: pointer;
	}

	button:disabled {
		background-color: #666;
		cursor: not-allowed;
	}

	.form-wrapper {
		width: 300px;
		margin: 0 auto;
	}

	.form-item {
		margin-bottom: 4px;
	}

	.error-message {
		background-color: #fee;
		color: #c33;
		padding: 0.5rem;
		border: 1px solid #fcc;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
</style>
