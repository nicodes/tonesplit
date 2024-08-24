import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
	plugins: [
		sveltekit(), 
		SvelteKitPWA({
			devOptions: {
				enabled: true
			},
			manifest: {
				name: 'Tone Split',
				short_name: 'Tone Split',
				description: 'Tone splitting for panning oscillators',
				icons: [
					{
					  src: 'pwa-64x64.png',
					  sizes: '64x64',
					  type: 'image/png'
					},
					{
					  src: 'pwa-192x192.png',
					  sizes: '192x192',
					  type: 'image/png'
					},
					{
					  src: 'pwa-512x512.png',
					  sizes: '512x512',
					  type: 'image/png',
					  purpose: 'any'  
					},
					{
					  src: 'maskable-icon-512x512.png',
					  sizes: '512x512',
					  type: 'image/png',
					  purpose: 'maskable'
					}
				]
			}
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
