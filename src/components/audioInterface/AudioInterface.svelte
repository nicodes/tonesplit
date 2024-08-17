<script lang="ts">
  import Input from "../input/Input.svelte";
  import styles from "./audioInterface.module.scss";
  import notes from "../../services/notes";
  import chords from "../../services/chords";

  let context: AudioContext;
  let tones: {
    osc: OscillatorNode;
    panner: StereoPannerNode;
    gain: GainNode;
    analyser: AnalyserNode;
    frequency: number;
    oscType: OscillatorType;
    pan: number;
    volume: number;
    dataArray: Uint8Array;
    bufferLength: number;
    muted: boolean;
  }[] = [];
  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;
  let playing = false;
  let selectedChord: keyof typeof chords = "Cmaj"; // Default selected chord

  function addTone() {
    const newTone = {
      osc: null,
      panner: null,
      gain: null,
      analyser: null,
      frequency: 440,
      oscType: "sine" as OscillatorType,
      pan: 0,
      volume: 1,
      dataArray: null,
      bufferLength: 0,
      muted: false, // Initialize the muted state
    };

    tones = [...tones, newTone];

    if (playing) {
      startTone(tones.length - 1);
    }
  }

  function removeTone(index: number) {
    if (tones[index] && playing) {
      tones[index].osc.stop(0);
    }

    tones = tones.filter((_, i) => i !== index);
  }

  function toggleMute(index: number) {
    tones[index].muted = !tones[index].muted;
    if (tones[index].muted) {
      tones[index].gain.gain.value = 0; // Mute the tone by setting gain to 0
    } else {
      tones[index].gain.gain.value = tones[index].volume; // Unmute by restoring the original volume
    }
  }

  function startTone(index: number) {
    if (!context) {
      context = new ((window as any).AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const tone = tones[index];
    tone.osc = context.createOscillator();
    tone.panner = context.createStereoPanner();
    tone.gain = context.createGain();
    tone.analyser = context.createAnalyser();

    tone.osc.type = tone.oscType;
    tone.osc.frequency.value = tone.frequency;
    tone.panner.pan.value = tone.pan;
    tone.gain.gain.value = tone.muted ? 0 : tone.volume; // Set initial gain based on muted state

    tone.osc.connect(tone.panner);
    tone.panner.connect(tone.gain);
    tone.gain.connect(tone.analyser);
    tone.analyser.connect(context.destination);

    tone.osc.start(0);

    tone.analyser.fftSize = 4096;
    tone.bufferLength = tone.analyser.frequencyBinCount;
    tone.dataArray = new Uint8Array(tone.bufferLength);
  }

  function toggleSound() {
    if (playing) {
      tones.forEach((tone) => tone.osc.stop(0));
      playing = false;
    } else {
      tones.forEach((_, index) => startTone(index));
      playing = true;
      drawWaveform();
    }
  }

  function drawWaveform() {
    if (!playing) return;

    requestAnimationFrame(drawWaveform);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "rgb(200, 200, 200)";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    tones.forEach((tone, index) => {
      tone.analyser.getByteTimeDomainData(tone.dataArray);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = `rgb(${index * 60}, 0, 255)`;
      canvasContext.beginPath();

      let sliceWidth = (canvas.width * 6.0) / tone.bufferLength;
      let x = 0;

      for (let i = 0; i < tone.bufferLength; i++) {
        let v = tone.dataArray[i] / 128.0;
        let y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    });
  }

  function playChord(chord: keyof typeof chords) {
    tones.forEach((t) => t.osc.stop(0));
    tones = chords[chord].map((note) => {
      return {
        osc: null,
        panner: null,
        gain: null,
        analyser: null,
        frequency: note,
        oscType: "sine" as OscillatorType,
        pan: 0,
        volume: 1,
        dataArray: null,
        bufferLength: 0,
        muted: false, // Initialize the muted state
      };
    });

    if (playing) {
      tones.forEach((_, i) => startTone(i));
    }
  }

  $: if (playing) {
    tones.forEach((tone) => {
      tone.osc.frequency.value = tone.frequency;
      tone.osc.type = tone.oscType;
      tone.panner.pan.value = tone.pan;
      tone.gain.gain.value = tone.muted ? 0 : tone.volume; // Adjust gain based on muted state
    });
  }

  $: if (canvas) {
    canvasContext = canvas.getContext("2d")!;
  }
</script>

<div class={styles.pedal}>
  <p class={styles.span}>ToneSplit</p>

  <canvas bind:this={canvas} width="300" height="80" class={styles.span}
  ></canvas>

  <div class={styles.grid}>
    <!-- Empty headers for mute and remove buttons -->
    <div><strong>#</strong></div>
    <div><strong>Waveform</strong></div>
    <div><strong>Frequency</strong></div>
    <div><strong>Volume</strong></div>
    <div><strong>Pan</strong></div>
    <div></div>
    <div></div>

    {#each tones as tone, index}
      <div>{index + 1}</div>
      <div>
        <select bind:value={tone.oscType}>
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>
      <div>
        <Input type="range" bind:value={tone.frequency} min={0} max={2000} />
      </div>
      <div>
        <Input
          type="range"
          bind:value={tone.volume}
          min={0}
          max={1}
          step={0.01}
        />
      </div>
      <div>
        <Input
          type="range"
          bind:value={tone.pan}
          min={-1}
          max={1}
          step={0.01}
        />
      </div>
      <div>
        <button on:click={() => toggleMute(index)}>
          {tone.muted ? "🔊" : "🔇"}
        </button>
      </div>
      <div>
        <button on:click={() => removeTone(index)}>❌</button>
      </div>
    {/each}

    <button on:click={addTone}>➕</button>
  </div>

  <div class={styles.chords}>
    <select bind:value={selectedChord} id="exampleSelect" name="options">
      {#each Object.keys(chords) as chord}
        <option value={chord}>{chord}</option>
      {/each}
    </select>
    <button on:click={() => playChord(selectedChord)}>Add Chord</button>
  </div>

  <button on:click={toggleSound}>
    {#if playing}🟥{:else}🟢{/if}
  </button>
</div>
