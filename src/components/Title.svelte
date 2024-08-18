<script>
  import { onMount, onDestroy } from "svelte";
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
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
    position: relative; /* Needed to contain the absolutely positioned span */
    grid-column-gap: 10px;
  }

  .text {
    font-size: 36px;
    font-weight: bold;
    font-family: "Righteous";

    &:first-child {
      text-align: right;
    }
  }

  .centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(25deg); /* Center and rotate */
    font-size: 2rem; /* Adjust size as needed */
    font-size: 100px;
  }
</style>
