<script>
	import AudioInterface from '$lib/components/AudioInterface.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main class="main">
	<AudioInterface />
</main>

<style>
	.main {
		margin: auto;
		margin-top: var(--space-xl);
		max-width: var(--page-max-width);
	}
</style>
