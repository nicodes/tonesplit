<script>
	import Logo from './Logo.svelte';
</script>

<header class="header">
	<Logo />
	<a href="/about">About</a>
	<a href="https://github.com/nicodes/tonesplit">GH</a>
</header>

<style lang="scss">
	.header {
		max-width: var(--header-max-width);
		margin: auto;
		gap: var(--space-lg);

		display: flex;
		justify-content: center;
		align-items: center;

		& > :nth-child(2) {
			margin-left: auto;
		}

		a {
			font-size: var(--font-md);
		}
	}
</style>
