<script lang="ts">
  import { onMount } from "svelte";

  import chords from "../../services/chords";
  import { createTone, stopTone, startTone } from "../../services/tones";
  import type { Tone } from "../../services/tones";

  import Input from "../input/Input.svelte";

  import styles from "./audioInterface.module.scss";

  let audioContext: AudioContext;
  let tones: Tone[] = [createTone(), createTone(444)];
  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;
  let playing = false;
  let selectedChord: keyof typeof chords = "Cmaj"; // Default selected chord

  function addTone() {
    const t = createTone();
    tones = [...tones, t];
    if (playing) startTone(audioContext, t);
  }

  function removeTone(index: number) {
    stopTone(tones[index]);
    tones = tones.filter((_, i) => i !== index);
  }

  function toggleMute(index: number) {
    tones[index].muted
      ? startTone(audioContext, tones[index])
      : stopTone(tones[index]);
    tones[index].muted = !tones[index].muted;
  }

  function togglePlaying() {
    if (playing) {
      tones.forEach((t) => stopTone(t));
      playing = false;
      return;
    }

    tones.forEach((t) => startTone(audioContext, t));
    playing = true;
    drawWaveform();
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

  function playChord(chord: keyof typeof chords) {
    tones.forEach((t) => stopTone(t));
    tones = chords[chord].map((note) => {
      return createTone(note);
    });

    if (playing) tones.forEach((t) => startTone(audioContext, t));
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
  }
</script>

<div class={styles.pedal}>
  <p class={styles.span}>ToneSplit</p>

  <canvas bind:this={canvas} width="300" height="80" class={styles.span}
  ></canvas>

  <div class={styles.grid}>
    <div><strong>#</strong></div>
    <div><strong>Waveform</strong></div>
    <div><strong>Frequency</strong></div>
    <div><strong>Volume</strong></div>
    <div><strong>Pan</strong></div>
    <div></div>
    <div></div>

    {#each tones as t, i}
      <div>{i + 1}</div>
      <select bind:value={t.oscType}>
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="sawtooth">Sawtooth</option>
        <option value="triangle">Triangle</option>
      </select>
      <Input type="range" bind:value={t.frequency} min={0} max={2000} />
      <Input type="range" bind:value={t.volume} min={0} max={1} step={0.01} />
      <Input type="range" bind:value={t.pan} min={-1} max={1} step={0.01} />
      <button on:click={() => toggleMute(i)}>{t.muted ? "🔊" : "🔇"}</button>
      <button on:click={() => removeTone(i)}>❌</button>
    {/each}

    <button on:click={addTone}>➕</button>
  </div>

  <div class={styles.chords}>
    <select bind:value={selectedChord} id="exampleSelect" name="options">
      {#each Object.keys(chords) as c}
        <option value={c}>{c}</option>
      {/each}
    </select>
    <button on:click={() => playChord(selectedChord)}>Add Chord</button>
  </div>

  <button on:click={togglePlaying}>
    {#if playing}🟥{:else}🟢{/if}
  </button>
</div>
