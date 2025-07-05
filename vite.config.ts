import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	ssr: {
		external: ['@node-rs/argon2']
	},
	optimizeDeps: {
		exclude: ['@node-rs/argon2', 'sharp', 'postgres']
	},
	define: {
		global: 'globalThis'
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./tests/setup.ts']
	}
});
