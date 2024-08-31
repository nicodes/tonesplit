<a class="logo-container" href="/">
	<p>Tone</p>
	<div></div>
	<div></div>
	<p>Split</p>
	<span>♪</span>
</a>

<style lang="scss">
	.logo-container {
		position: relative; /* Needed to contain the absolutely positioned span */
		text-decoration: none; /* Remove underline */

		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 10px;

		p {
			font-family: 'Righteous';
			font-size: var(--font-lg);
			font-weight: bold;

			&:first-child {
				text-align: right;
			}
		}

		span {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) rotate(25deg); /* Center and rotate */

			font-size: 6rem; /* Custom size */
		}
	}
</style>
