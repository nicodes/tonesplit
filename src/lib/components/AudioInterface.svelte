<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    clearTimeout as clearTimeoutAudio,
    setTimeout as setTimeoutAudio
  } from 'audio-context-timers'

  import chords from '$lib/services/chords'
  import {
    createTone,
    stopTone,
    startTone,
    toMilliseconds,
    formatTimeout
  } from '$lib/services/audio'
  import type { Tone } from '$lib/services/audio'

  import Dial from './Dial.svelte'
  import Select from './Select.svelte'
  import Circle from './Circle.svelte'

  const colors = ['orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

  let audioContext: AudioContext
  let tones: Tone[] = [
    createTone({ frequency: 108, pan: -1 }),
    createTone({ frequency: 111, pan: -1 }),

    createTone({ frequency: 114, pan: 1 }),
    createTone({ frequency: 117, pan: 1 })
  ]
  let canvas: HTMLCanvasElement
  let canvasContext: CanvasRenderingContext2D
  let playing = false
  const selectedChordDefault = '-- chord --'
  let selectedChord: typeof selectedChordDefault | keyof typeof chords =
    selectedChordDefault // Default selected chord

  let drawRequestId: number
  let audioTimeout: number
  let countdownInterval: number
  let numberInputMode = false
  let timeout = 5 // Default timeout of 5 seconds
  let applyTimeout = false // Controls whether the timeout is applied
  let timeoutUnit: 'seconds' | 'minutes' | 'hours' = 'seconds' // Default unit
  let remainingTime = '00:00:00' // Default remaining time display
  let remainingMiliseconds = 0 // Track remaining seconds

  function toggleNumberInputMode() {
    numberInputMode = !numberInputMode
  }

  function addTone() {
    const t = createTone()
    tones = [...tones, t]
    if (playing) startTone(audioContext, t)
  }

  function removeTone(index: number) {
    stopTone(tones[index])
    tones = tones.filter((_, i) => i !== index)
  }

  function removeAllTones() {
    tones.forEach(stopTone)
    tones = []
  }

  function playTones() {
    tones.forEach((t) => startTone(audioContext, t))
    drawWaveform() // Start drawing when playing
    if (applyTimeout && remainingMiliseconds > 0) {
      startCountdown(remainingMiliseconds) // Resume countdown
      audioTimeout = setTimeoutAudio(() => {
        togglePlaying() // Stop after remaining time
      }, remainingMiliseconds)
    }
  }

  function stopTones() {
    tones.forEach((t) => stopTone(t))
    cancelAnimationFrame(drawRequestId) // Stop drawing when not playing
    clearTimeoutAudio(audioTimeout) // Clear any existing timeout when stopping
    clearInterval(countdownInterval) // Pause the countdown
  }

  function togglePlaying() {
    playing = !playing
    if (playing) playTones()
    else stopTones()
  }

  /** Mutes a specific oscillator by index */
  function toggleMute(index: number) {
    if (tones[index].muted) startTone(audioContext, tones[index])
    else stopTone(audioContext, tones[index])
    tones[index].muted = !tones[index].muted
  }

  function playChord(chord: keyof typeof chords) {
    tones.forEach(stopTone)
    tones = [
      ...tones,
      ...chords[chord].map((frequency) => createTone({ frequency }))
    ]
    if (playing) tones.forEach((t) => startTone(audioContext, t))
  }

  function startCountdown(totalMiliseconds: number) {
    remainingMiliseconds = totalMiliseconds // Initialize remaining seconds
    remainingTime = formatTimeout(remainingMiliseconds)

    countdownInterval = setInterval(() => {
      remainingMiliseconds -= 1000
      remainingTime = formatTimeout(remainingMiliseconds)

      if (remainingMiliseconds <= 0) {
        clearInterval(countdownInterval) // Stop countdown when time runs out
      }
    }, 1000)
  }

  function refreshTimer() {
    clearInterval(countdownInterval)
    const timeoutInMiliseconds = toMilliseconds(timeout, timeoutUnit)
    remainingMiliseconds = timeoutInMiliseconds
    remainingTime = formatTimeout(remainingMiliseconds)
    if (playing) {
      startCountdown(remainingMiliseconds) // Restart countdown if audio is playing
      clearTimeoutAudio(audioTimeout)
      audioTimeout = setTimeoutAudio(togglePlaying, remainingMiliseconds)
    }
  }

  function drawBackground() {
    const chartHeight = canvas.height / 2
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the separating border between the channels
    canvasContext.strokeStyle = 'white' // Black border
    canvasContext.lineWidth = 2
    canvasContext.beginPath()
    canvasContext.moveTo(0, chartHeight)
    canvasContext.lineTo(canvas.width, chartHeight)
    canvasContext.stroke()
  }

  function drawChannel(
    context: CanvasRenderingContext2D,
    sliceWidth: number,
    tone: Tone,
    startY: number,
    chartHeight: number,
    index: number
  ) {
    context.lineWidth = 2
    context.strokeStyle = colors[index]
    context.beginPath()

    let x = 0
    for (let i = 0; i < tone.bufferLength; i++) {
      const v = tone.dataArray[i] / 128.0
      const y = startY + (v * chartHeight) / 2
      if (i === 0) context.moveTo(x, y)
      else context.lineTo(x, y)

      x += sliceWidth
    }
    context.stroke()
  }

  function drawWaveform() {
    if (!playing) return

    const chartHeight = canvas.height / 2

    // Draw the background and divider
    drawBackground()

    tones.forEach((tone, index) => {
      if (tone.muted) return

      tone.analyser.getByteTimeDomainData(tone.dataArray)
      const sliceWidth = (canvas.width * 6.0) / tone.bufferLength

      // Draw on the top half for left channel
      if (tone.pan <= 0) {
        drawChannel(canvasContext, sliceWidth, tone, 0, chartHeight, index)
      }

      // Draw on the bottom half for right channel
      if (tone.pan >= 0) {
        drawChannel(
          canvasContext,
          sliceWidth,
          tone,
          chartHeight,
          chartHeight,
          index
        )
      }
    })

    // Use requestAnimationFrame to throttle the draw calls
    drawRequestId = requestAnimationFrame(drawWaveform)
  }

  onMount(() => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    canvasContext = canvas.getContext('2d')!
  })

  onDestroy(() => {
    cancelAnimationFrame(drawRequestId) // Clean up the animation frame on component destroy
    clearTimeoutAudio(audioTimeout) // Clear the timeout on destroy
    clearInterval(countdownInterval) // Clear the countdown interval
    tones.forEach(stopTone) // Stop all tones to free up resources
  })

  $: if (playing) {
    tones.forEach((t) => {
      t.osc.frequency.value = t.frequency
      t.osc.type = t.oscType
      t.panner.pan.value = t.pan
      t.gain.gain.value = t.muted ? 0 : t.volume
    })
    drawWaveform()
  }
</script>

<div class="audioController">
  <canvas bind:this={canvas} width="300" height="160" class="canvas"></canvas>

  <div class="grid">
    {#if tones.length > 0}
      <div></div>
      <div><strong>Wave</strong></div>
      <div><strong>Freq</strong></div>
      <div><strong>Vol</strong></div>
      <div><strong>Pan</strong></div>

      {#each tones as t, i}
        <button on:click={() => toggleMute(i)}>
          <Circle radius={8} color={t.muted ? 'red' : colors[i]} />
        </button>

        <Select bind:value={t.oscType}>
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </Select>

        {#if numberInputMode}
          <input type="number" bind:value={t.frequency} min={0} max={2000} />
          <input
            type="number"
            bind:value={t.volume}
            min={0}
            max={1}
            step="0.01"
          />
          <input
            type="number"
            bind:value={t.pan}
            min={-1}
            max={1}
            step="0.01"
          />
        {:else}
          <Dial bind:value={t.frequency} min={0} max={2000} />
          <Dial bind:value={t.volume} min={0} max={1} />
          <Dial bind:value={t.pan} min={-1} max={1} />
        {/if}
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

    <Select bind:value={selectedChord}>
      <option value={selectedChordDefault}>{selectedChordDefault}</option>
      {#each Object.keys(chords) as c}
        <option value={c}>{c}</option>
      {/each}
    </Select>

    <div></div>
    <button on:click={toggleNumberInputMode}>
      {#if numberInputMode}Dials{:else}Edit{/if}
    </button>
    <button on:click={removeAllTones}>❌</button>
  </div>

  <button on:click={togglePlaying}>
    {#if playing}🟥{:else}🟢{/if}
  </button>

  <div>
    <label for="timeout">Timeout:</label>
    <input id="timeout" type="number" bind:value={timeout} min={1} step="1" />
    <Select bind:value={timeoutUnit}>
      <option value="seconds">Seconds</option>
      <option value="minutes">Minutes</option>
      <option value="hours">Hours</option>
    </Select>
    <input
      id="applyTimeout"
      type="checkbox"
      bind:checked={applyTimeout}
      on:change={refreshTimer}
    />
    <label for="applyTimeout">Apply Timeout</label>
  </div>

  {#if applyTimeout}
    <div class="countdown">
      Time Remaining: {remainingTime}
    </div>
    <button on:click={refreshTimer}>Refresh Timer</button>
  {/if}
</div>

<style lang="scss">
  .audioController {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: auto;

    button {
      min-height: 44px;
      min-width: 44px;

      background-color: transparent;
      border: 2px solid white;
      border-radius: 8px;
      color: white;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .canvas {
    border: 3px solid white;
    border-radius: 8px;
  }

  .grid {
    display: grid;
    grid-template-columns: min-content auto min-content min-content min-content;
    align-items: center;
    gap: 12px;
  }

  .subgrid {
    & > :first-child {
      display: flex;
    }
  }

  .countdown {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-top: 10px;
  }
</style>
