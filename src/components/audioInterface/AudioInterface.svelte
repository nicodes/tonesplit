<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import chords from "../../services/chords";
  import { createTone, stopTone, startTone } from "../../services/tones";
  import type { Tone } from "../../services/tones";

  import Title from "../title/Title.svelte";
  import Dial from "../dial/Dial.svelte";

  import styles from "./audioInterface.module.scss";

  let audioContext: AudioContext;
  let tones: Tone[] = [
    createTone({ pan: -1 }),
    createTone({ frequency: 444, pan: 1 }),
  ];
  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;
  let playing = false;
  const selectedChordDefault = "-- chord --";
  let selectedChord: typeof selectedChordDefault | keyof typeof chords =
    selectedChordDefault; // Default selected chord

  let drawRequestId: number;

  function addTone() {
    const t = createTone();
    tones = [...tones, t];
    if (playing) startTone(audioContext, t);
  }

  function removeTone(index: number) {
    stopTone(tones[index]);
    tones = tones.filter((_, i) => i !== index);
  }

  function removeAllTones() {
    tones.forEach(stopTone);
    tones = [];
  }

  function togglePlaying() {
    if (playing) {
      tones.forEach((t) => stopTone(t));
      cancelAnimationFrame(drawRequestId); // Stop drawing when not playing
    } else {
      tones.forEach((t) => startTone(audioContext, t));
      drawWaveform(); // Start drawing when playing
    }
    playing = !playing;
  }

  function toggleMute(index: number) {
    if (tones[index].muted) startTone(audioContext, tones[index]);
    else stopTone(tones[index]);
    tones[index].muted = !tones[index].muted;
  }

  function playChord(chord: keyof typeof chords) {
    tones.forEach(stopTone);
    tones = [
      ...tones,
      ...chords[chord].map((frequency) => createTone({ frequency })),
    ];
    if (playing) tones.forEach((t) => startTone(audioContext, t));
  }

  function drawBackground() {
    const chartHeight = canvas.height / 2;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the separating border between the channels
    canvasContext.strokeStyle = "white"; // Black border
    canvasContext.lineWidth = 2;
    canvasContext.beginPath();
    canvasContext.moveTo(0, chartHeight);
    canvasContext.lineTo(canvas.width, chartHeight);
    canvasContext.stroke();
  }

  function drawChannel(
    context: CanvasRenderingContext2D,
    sliceWidth: number,
    tone: Tone,
    startY: number,
    chartHeight: number,
    index: number
  ) {
    context.lineWidth = 2;
    context.strokeStyle = `rgb(${index * 60}, 0, 255)`;
    context.beginPath();

    let x = 0;
    for (let i = 0; i < tone.bufferLength; i++) {
      const v = tone.dataArray[i] / 128.0;
      // if (Math.abs(v) < 0.01) return;

      const y = startY + (v * chartHeight) / 2;
      i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
      x += sliceWidth;
    }
    // context.lineTo(canvas.width, startY + chartHeight / 2);
    context.stroke();
  }

  function drawWaveform() {
    if (!playing) return;

    const chartHeight = canvas.height / 2;

    // Draw the background and divider
    drawBackground();

    tones.forEach((tone, index) => {
      if (tone.muted) return;

      tone.analyser.getByteTimeDomainData(tone.dataArray);
      const sliceWidth = (canvas.width * 6.0) / tone.bufferLength;

      if (tone.pan >= 0) {
        // Draw on the top half for left channel
        drawChannel(canvasContext, sliceWidth, tone, 0, chartHeight, index);
      }
      if (tone.pan <= 0) {
        // Draw on the bottom half for right channel
        drawChannel(
          canvasContext,
          sliceWidth,
          tone,
          chartHeight,
          chartHeight,
          index
        );
      }
    });

    // Use requestAnimationFrame to throttle the draw calls
    drawRequestId = requestAnimationFrame(drawWaveform);
  }

  onMount(() => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    canvasContext = canvas.getContext("2d")!;
  });

  onDestroy(() => {
    cancelAnimationFrame(drawRequestId); // Clean up the animation frame on component destroy
    tones.forEach(stopTone); // Stop all tones to free up resources
  });

  $: if (playing) {
    tones.forEach((t) => {
      t.osc.frequency.value = t.frequency;
      t.osc.type = t.oscType;
      t.panner.pan.value = t.pan;
      t.gain.gain.value = t.muted ? 0 : t.volume;
    });
    drawWaveform();
  }
</script>

<div class={styles.pedal}>
  <Title />

  <canvas bind:this={canvas} width="300" height="160" class={styles.canvas}
  ></canvas>

  <div class={styles.grid}>
    {#if tones.length > 0}
      <div><strong>#</strong></div>
      <div><strong>Wave</strong></div>
      <div><strong>Freq</strong></div>
      <div><strong>Vol</strong></div>
      <div><strong>Pan</strong></div>

      {#each tones as t, i}
        <div>{i + 1}</div>
        <div class={styles.subgrid}>
          <select bind:value={t.oscType}>
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
          <button on:click={() => toggleMute(i)}>{t.muted ? "🔊" : "🔇"}</button
          >
          <button on:click={() => removeTone(i)}>❌</button>
        </div>
        <Dial bind:value={t.frequency} min={0} max={2000} />
        <Dial bind:value={t.volume} min={0} max={1} />
        <Dial bind:value={t.pan} min={-1} max={1} />
      {/each}
    {/if}

    <button
      on:click={() =>
        selectedChord === selectedChordDefault
          ? addTone()
          : playChord(selectedChord)}
    >
      ➕
    </button>
    <select bind:value={selectedChord}>
      <option value={selectedChordDefault}>{selectedChordDefault}</option>
      {#each Object.keys(chords) as c}
        <option value={c}>{c}</option>
      {/each}
    </select>

    <div class={styles.chords}>
      <button on:click={removeAllTones}>Clear</button>
    </div>
  </div>

  <button on:click={togglePlaying}>
    {#if playing}🟥{:else}🟢{/if}
  </button>
</div>
