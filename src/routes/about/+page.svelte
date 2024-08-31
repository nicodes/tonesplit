<script>
	import AudioInterface from '$lib/components/AudioInterface.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<main class="main">
	<h1>About Tone Split</h1>
	<p>
		Welcome to Tone Split, an innovative application designed to help you explore and manipulate
		audio tones with ease. Whether you're a musician, sound engineer, or just someone who loves
		experimenting with sound, Tone Split offers a range of features to enhance your audio
		experience.
	</p>
	<p>
		Our app allows you to create and manage multiple tones, adjust their pan and volume, and even
		play chords. With a user-friendly interface and powerful audio processing capabilities, Tone
		Split is the perfect tool for anyone looking to dive into the world of sound.
	</p>
	<p>
		Tone Split was developed with the goal of making audio manipulation accessible to everyone. We
		believe that sound is a powerful medium, and our app is here to help you harness its potential.
		Whether you're creating music, designing soundscapes, or just having fun, Tone Split is here to
		support your creative journey.
	</p>
	<p>
		Thank you for choosing Tone Split. We hope you enjoy using our app as much as we enjoyed
		creating it. If you have any questions, feedback, or suggestions, please don't hesitate to reach
		out to us.
	</p>
</main>

<style>
	.main {
		margin: auto;
		margin-top: var(--space-xl);
		max-width: var(--page-max-width);

		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}
</style>
