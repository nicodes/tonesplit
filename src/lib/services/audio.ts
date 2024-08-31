export interface Tone {
  osc: OscillatorNode
  panner: StereoPannerNode
  gain: GainNode
  analyser: AnalyserNode
  frequency: number
  oscType: OscillatorType
  pan: number
  volume: number
  dataArray: Uint8Array
  bufferLength: number
  muted: boolean
}

export function createTone({
  frequency = undefined,
  pan = undefined,
  volume = undefined
}: {
  frequency?: number
  pan?: number
  volume?: number
} = {}) {
  return {
    osc: null,
    panner: null,
    gain: null,
    analyser: null,
    frequency: frequency || 440,
    oscType: 'sine' as OscillatorType,
    pan: pan || 0,
    volume: volume || 0.3,
    dataArray: null,
    bufferLength: 0,
    muted: false // Initialize the muted state
  }
}

export function startTone(audioContext: AudioContext, tone: Tone) {
  tone.osc = audioContext.createOscillator()
  tone.panner = audioContext.createStereoPanner()
  tone.gain = audioContext.createGain()
  tone.analyser = audioContext.createAnalyser()

  tone.osc.type = tone.oscType
  tone.osc.frequency.value = tone.frequency
  tone.panner.pan.value = tone.pan
  tone.gain.gain.value = tone.muted ? 0 : tone.volume // Set initial gain based on muted state

  tone.osc.connect(tone.panner)
  tone.panner.connect(tone.gain)
  tone.gain.connect(tone.analyser)
  tone.analyser.connect(audioContext.destination)
  tone.osc.start(0)

  tone.analyser.fftSize = 4096
  tone.bufferLength = tone.analyser.frequencyBinCount
  tone.dataArray = new Uint8Array(tone.bufferLength)
}

export function stopTone(tone: Tone) {
  tone.osc?.stop(0)
}

export function toMilliseconds(
  timeout: number,
  unit: 'seconds' | 'minutes' | 'hours'
) {
  switch (unit) {
    case 'minutes':
      return timeout * 60 * 1000
    case 'hours':
      return timeout * 60 * 60 * 1000
    case 'seconds':
    default:
      return timeout * 1000
  }
}

export function formatTimeout(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
