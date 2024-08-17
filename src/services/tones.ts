export interface Tone {
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
}

export function createTone() {
  return {
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
}

export function stopTone(tone: Tone) {
  tone.osc.stop(0);
}
