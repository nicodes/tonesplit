<script>
  import { onMount, onDestroy } from "svelte";

  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = (max - min) / 256;
  export let label = "";

  let knob;
  let startX, startY, startValue;

  function handleStart(event) {
    event.preventDefault();
    const touch = event.touches ? event.touches[0] : event;
    startX = touch.clientX;
    startY = touch.clientY;
    startValue = value;
  }

  function handleMove(event) {
    if (!startX || !startY) return;
    const touch = event.touches ? event.touches[0] : event;
    let deltaY = step * (startY - touch.clientY);
    value = Math.max(min, Math.min(max, startValue + deltaY));
  }

  function handleEnd() {
    startX = undefined;
    startY = undefined;
  }

  onMount(() => {
    if (knob) {
      knob.addEventListener("mousedown", handleStart);
      knob.addEventListener("touchstart", handleStart);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
  });

  onDestroy(() => {
    if (knob) {
      knob.removeEventListener("mousedown", handleStart);
      knob.removeEventListener("touchstart", handleStart);
    }

    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("touchmove", handleMove);

    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("touchend", handleEnd);
  });
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
  <span>{label}</span>
  <div
    class="knob"
    bind:this={knob}
    style="transform: rotate({((value - min) / (max - min)) * 270 - 135}deg);"
  />
</label>

<style>
  .knob {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
  }

  .knob::before {
    content: "";
    position: absolute;
    width: 3px;
    height: 50%;
    background: #333;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    transform-origin: bottom;
    transition: transform 0.1s;
  }
</style>
