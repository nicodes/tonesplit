<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let value: number = 0;
  export let min: number = 0;
  export let max: number = 100;
  export let label: string = "";

  const diff: number = max - min;
  export let step: number = diff / 256;
  const keyboardStep: number = diff / 100;

  let knob: HTMLDivElement | undefined;
  let startX: number | undefined;
  let startY: number | undefined;
  let startValue: number;

  function handleStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    const touch = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0]
      : (event as MouseEvent);
    startX = touch.clientX;
    startY = touch.clientY;
    startValue = value;
  }

  function handleMove(event: MouseEvent | TouchEvent): void {
    if (startX === undefined || startY === undefined) return;
    const touch = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0]
      : (event as MouseEvent);
    const deltaY: number = step * (startY - touch.clientY);
    value = Math.max(min, Math.min(max, startValue + deltaY));
  }

  function handleEnd(): void {
    startX = undefined;
    startY = undefined;
  }

  function handleKeydown(event: KeyboardEvent): void {
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
<label class="label">
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

<style lang="scss">
  .knob {
    position: relative;
    min-height: 44px;
    min-width: 44px;

    border: 3px solid var(--white);
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    outline: none;
  }

  // TODO fix this color
  .knob:focus {
    box-shadow: 0 0 0 3px rgba(21, 156, 228, 0.4);
  }

  .knob::before {
    content: "";
    width: 3px;
    height: 50%;
    background: var(--white);

    position: absolute;
    top: 0;
    left: 50%;

    transform: translateX(-50%);
    transform-origin: bottom;
    transition: transform 0.1s;
  }
</style>
