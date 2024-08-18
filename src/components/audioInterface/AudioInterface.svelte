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
  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;
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
    tones.forEach((t) => stopTone(t));
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
    tones.forEach((t) => stopTone(t));
    tones = [...tones, ...chords[chord].map((note) => createTone(note))];
    if (playing) tones.forEach((t) => startTone(audioContext, t));
  }

  function drawWaveform() {
    if (!playing) return;

    requestAnimationFrame(drawWaveform);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "rgb(200, 200, 200)";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    tones.forEach((tone, index) => {
      if (tone.muted) return;
      tone.analyser.getByteTimeDomainData(tone.dataArray);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = `rgb(${index * 60}, 0, 255)`;
      canvasContext.beginPath();

      let x = 0;
      let sliceWidth = (canvas.width * 6.0) / tone.bufferLength;
      for (let i = 0; i < tone.bufferLength; i++) {
        let v = tone.dataArray[i] / 128.0;
        if (Math.abs(v) < 0.01) return;

        let y = (v * canvas.height) / 2;
        if (i === 0) canvasContext.moveTo(x, y);
        else canvasContext.lineTo(x, y);
        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    });
  }

  onMount(() => {
    audioContext = new ((window as any).AudioContext ||
      (window as any).webkitAudioContext)();
    canvasContext = canvas.getContext("2d")!;
  });

  $: if (playing) {
    tones.forEach((t) => {
      t.osc.frequency.value = t.frequency;
      t.osc.type = t.oscType;
      t.panner.pan.value = t.pan;
      t.gain.gain.value = t.muted ? 0 : t.volume; // Adjust gain based on muted state
    });
    drawWaveform();
  }
</script>

<div class={styles.pedal}>
  <p class={styles.span}>ToneSplit</p>

  <canvas bind:this={canvas} width="300" height="80" class={styles.span}
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
    <select bind:value={selectedChord} id="exampleSelect" name="options">
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
