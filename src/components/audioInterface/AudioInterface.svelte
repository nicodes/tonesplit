<script lang="ts">
  let context: AudioContext;
  let osc1: OscillatorNode, osc2: OscillatorNode;
  let panner1: StereoPannerNode, panner2: StereoPannerNode;
  let gainNode1: GainNode, gainNode2: GainNode;
  let playing = false;

  // Define initial frequencies, oscillator types, panning, and volume
  let frequency1 = 440;
  let frequency2 = 450;
  let oscType1: OscillatorType = "sine";
  let oscType2: OscillatorType = "sine";
  let pan1 = -1; // Completely to the left
  let pan2 = 1; // Completely to the right
  let volume1 = 1; // Full volume
  let volume2 = 1; // Full volume

  function toggleSound() {
    if (!playing) {
      context = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();

      osc1 = context.createOscillator();
      osc2 = context.createOscillator();
      panner1 = context.createStereoPanner();
      panner2 = context.createStereoPanner();
      gainNode1 = context.createGain();
      gainNode2 = context.createGain();

      osc1.type = oscType1;
      osc1.frequency.value = frequency1;

      osc2.type = oscType2;
      osc2.frequency.value = frequency2;

      panner1.pan.value = pan1;
      panner2.pan.value = pan2;

      gainNode1.gain.value = volume1;
      gainNode2.gain.value = volume2;

      osc1.connect(panner1);
      osc2.connect(panner2);

      panner1.connect(gainNode1);
      panner2.connect(gainNode2);

      gainNode1.connect(context.destination);
      gainNode2.connect(context.destination);

      osc1.start(0);
      osc2.start(0);
      playing = true;
    } else {
      osc1.stop(0);
      osc2.stop(0);
      playing = false;
    }
  }

  // Reactive statements to adjust frequency, oscillator type, panning, and volume in real time
  $: if (playing && osc1) {
    osc1.frequency.value = frequency1;
    osc1.type = oscType1;
    panner1.pan.value = pan1;
    gainNode1.gain.value = volume1;
  }
  $: if (playing && osc2) {
    osc2.frequency.value = frequency2;
    osc2.type = oscType2;
    panner2.pan.value = pan2;
    gainNode2.gain.value = volume2;
  }
</script>

<div>
  <button on:click={toggleSound}>
    {#if playing}Stop sound{:else}Play sine waves{/if}
  </button>
  <div>
    <label>
      Tone 1 Frequency:
      <input type="range" min="20" max="2000" bind:value={frequency1} />
    </label>
    <label>
      Tone 1 Type:
      <select bind:value={oscType1}>
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="sawtooth">Sawtooth</option>
        <option value="triangle">Triangle</option>
      </select>
    </label>
    <label>
      Tone 1 Pan:
      <input type="range" min="-1" max="1" step="0.1" bind:value={pan1} />
    </label>
    <label>
      Tone 1 Volume:
      <input type="range" min="0" max="1" step="0.01" bind:value={volume1} />
    </label>
  </div>
  <div>
    <label>
      Tone 2 Frequency:
      <input type="range" min="20" max="2000" bind:value={frequency2} />
    </label>
    <label>
      Tone 2 Type:
      <select bind:value={oscType2}>
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="sawtooth">Sawtooth</option>
        <option value="triangle">Triangle</option>
      </select>
    </label>
    <label>
      Tone 2 Pan:
      <input type="range" min="-1" max="1" step="0.1" bind:value={pan2} />
    </label>
    <label>
      Tone 2 Volume:
      <input type="range" min="0" max="1" step="0.01" bind:value={volume2} />
    </label>
  </div>
</div>
