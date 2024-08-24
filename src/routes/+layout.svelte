<script>
	import { pwaInfo } from 'virtual:pwa-info';
	import '@fontsource/righteous';
	import '../app.css';

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
	{@html webManifest}
</svelte:head>

<div class="app">
	<!-- <Header /> -->

	<slot />

	<!-- <footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer> -->
</div>

<style>
</style>
