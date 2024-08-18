<script>
  import { onMount, onDestroy } from "svelte";

  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let label = "";

  const diff = max - min;
  export let step = diff / 256;
  const keyboardStep = diff / 100;

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

  function handleKeydown(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      value = Math.min(max, value + keyboardStep);
      event.preventDefault();
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      value = Math.max(min, value - keyboardStep);
      event.preventDefault();
    }
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
    tabindex="0"
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-label={label}
    on:keydown={handleKeydown}
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
    outline: none;
  }

  .knob:focus {
    box-shadow: 0 0 0 3px rgba(21, 156, 228, 0.4);
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
