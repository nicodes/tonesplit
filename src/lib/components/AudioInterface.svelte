<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let audioContext: AudioContext | null = null
  let oscillator: OscillatorNode | null = null
  let gainNode: GainNode | null = null
  let playing = false

  let fakeAudioElement: HTMLAudioElement

  function createAudioContext() {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      })
    }
  }

  function startOscillator() {
    createAudioContext()

    if (audioContext && !oscillator) {
      oscillator = audioContext.createOscillator()
      gainNode = audioContext.createGain()

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // Default frequency
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime) // Lower volume

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start()
    }
  }

  function stopOscillator() {
    if (oscillator) {
      oscillator.stop()
      oscillator.disconnect()
      oscillator = null
    }
    if (gainNode) {
      gainNode.disconnect()
      gainNode = null
    }
  }

  function togglePlay() {
    playing = !playing
    if (playing) {
      startFakeAudio()
      startOscillator()
    } else {
      stopFakeAudio()
      stopOscillator()
    }
  }

  function startFakeAudio() {
    if (fakeAudioElement) {
      fakeAudioElement.play()
    }
  }

  function stopFakeAudio() {
    if (fakeAudioElement) {
      fakeAudioElement.pause()
      fakeAudioElement.currentTime = 0
    }
  }

  onMount(() => {
    fakeAudioElement = new Audio()
    fakeAudioElement.src =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgLsAAAB3AQACABAAZGF0YQAAAAA=' // 1-second silent audio
    fakeAudioElement.loop = true

    createAudioContext()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        createAudioContext()
        if (playing) startOscillator()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    onDestroy(() => {
      stopFakeAudio()
      stopOscillator()
      if (audioContext) {
        audioContext.close()
        audioContext = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    })
  })
</script>

<div class="controls">
  <button on:click={togglePlay}>
    {#if playing}🟥 Stop{:else}🟢 Play{/if}
  </button>
</div>

<style>
  .controls {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  button {
    padding: 10px 20px;
    font-size: 1.2em;
    cursor: pointer;
    border: 2px solid #333;
    border-radius: 5px;
    background-color: #f0f0f0;
    color: #333;
  }
</style>
