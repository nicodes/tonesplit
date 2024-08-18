<script lang="ts">
  import { onMount } from "svelte";

  import chords from "../../services/chords";
  import { createTone, stopTone, startTone } from "../../services/tones";
  import type { Tone } from "../../services/tones";

  import Input from "../input/Input.svelte";
  import Dial from "../dial/Dial.svelte";

  import styles from "./audioInterface.module.scss";

  let audioContext: AudioContext;
  let tones: Tone[] = [createTone(), createTone(444)];
  let canvasLeft: HTMLCanvasElement;
  let canvasRight: HTMLCanvasElement;
  let canvasContextLeft: CanvasRenderingContext2D;
  let canvasContextRight: CanvasRenderingContext2D;
  let playing = false;
  const selectedChordDefault = "-- chord --";
  let selectedChord: typeof selectedChordDefault | keyof typeof chords =
    selectedChordDefault; // Default selected chord

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
    if (playing) tones.forEach((t) => stopTone(t));
    else tones.forEach((t) => startTone(audioContext, t));
    playing = !playing;
  }

  function toggleMute(index: number) {
    if (tones[index].muted) startTone(audioContext, tones[index]);
    else stopTone(tones[index]);
    tones[index].muted = !tones[index].muted;
  }

  function playChord(chord: keyof typeof chords) {
    tones.forEach(stopTone);
    tones = [...tones, ...chords[chord].map(createTone)];
    if (playing) tones.forEach((t) => startTone(audioContext, t));
  }

  function drawChannel(
    context: CanvasRenderingContext2D,
    channel: HTMLCanvasElement,
    sliceWidth: number,
    tone: Tone,
    index: number
  ) {
    context.lineWidth = 2;
    context.strokeStyle = `rgb(${index * 60}, 0, 255)`;
    context.beginPath();

    let x = 0;
    for (let i = 0; i < tone.bufferLength; i++) {
      const v = tone.dataArray[i] / 128.0;
      if (Math.abs(v) < 0.01) return;

      const y = (v * channel.height) / 2;
      i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(channel.width, channel.height / 2);
    context.stroke();
  }

  function drawWaveform() {
    if (!playing) return;

    requestAnimationFrame(drawWaveform);
    canvasContextLeft.clearRect(0, 0, canvasLeft.width, canvasLeft.height);
    canvasContextRight.clearRect(0, 0, canvasRight.width, canvasRight.height);

    tones.forEach((tone, index) => {
      if (tone.muted) return;

      tone.analyser.getByteTimeDomainData(tone.dataArray);
      const sliceWidth = (canvasLeft.width * 6.0) / tone.bufferLength;

      if (tone.pan >= 0)
        drawChannel(canvasContextLeft, canvasLeft, sliceWidth, tone, index);
      if (tone.pan <= 0)
        drawChannel(canvasContextRight, canvasRight, sliceWidth, tone, index);
    });
  }

  onMount(() => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    canvasContextLeft = canvasLeft.getContext("2d")!;
    canvasContextRight = canvasRight.getContext("2d")!;
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
  <p class={styles.span}>ToneSplit</p>

  <canvas bind:this={canvasLeft} width="300" height="80" class={styles.span}
  ></canvas>
  <canvas bind:this={canvasRight} width="300" height="80" class={styles.span}
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
