<div class="title-container">
  <span class="text">Tone</span>
  <div></div>
  <div></div>
  <span class="text">Split</span>
  <span class="centered">♪</span>
</div>

<style lang="scss">
  .title-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 10px;

    position: relative; /* Needed to contain the absolutely positioned span */
  }

  .text {
    font-family: "Righteous";
    font-size: var(--font-lg);
    font-weight: bold;

    &:first-child {
      text-align: right;
    }
  }

  .centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(25deg); /* Center and rotate */

    font-size: 6rem; /* Custom size */
  }
</style>
