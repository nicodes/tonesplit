<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let audioContext: AudioContext | null = null
  let oscillator: OscillatorNode | null = null
  let gainNode: GainNode | null = null
  let silentAudio: AudioBufferSourceNode | null = null
  let playing = false

  function createAudioContext() {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      })

      // Create silent audio buffer
      const buffer = audioContext.createBuffer(1, 44100 * 2, 44100) // 2 seconds of silence
      silentAudio = audioContext.createBufferSource()
      silentAudio.buffer = buffer
      silentAudio.loop = true
      silentAudio.connect(audioContext.destination)
      silentAudio.start(0)
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
      startOscillator()
    } else {
      stopOscillator()
    }
  }

  onMount(() => {
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
