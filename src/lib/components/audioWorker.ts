export default () => {
  let audioContext: AudioContext | null = null

  self.onmessage = (event: MessageEvent) => {
    if (event.data.action === 'setContext') {
      audioContext = event.data.audioContext
    }

    if (audioContext) {
      setInterval(() => {
        audioContext.resume()
      }, 1000)
    }
  }
}
