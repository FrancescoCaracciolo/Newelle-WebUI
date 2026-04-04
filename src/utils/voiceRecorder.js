const SAMPLE_RATE = 16000
const BITS_PER_SAMPLE = 16
const NUM_CHANNELS = 1

class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioContext = null
    this.chunks = []
    this.stream = null
    this.onTranscript = null
    this.onError = null
    this.onStateChange = null
    this.apiRecognize = null
  }

  async start(apiRecognize) {
    this.apiRecognize = apiRecognize
    this.chunks = []

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: NUM_CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      const source = this.audioContext.createMediaStreamSource(this.stream)
      const processor = this.audioContext.createScriptProcessor(4096, NUM_CHANNELS, NUM_CHANNELS)

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0)
        this.chunks.push(new Float32Array(channelData))
      }

      source.connect(processor)
      processor.connect(this.audioContext.destination)

      if (this.onStateChange) this.onStateChange('recording')
    } catch (err) {
      if (this.onError) this.onError(err.message)
      throw err
    }
  }

  async stop() {
    if (this.onStateChange) this.onStateChange('processing')

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    const wavBlob = this._createWavBlob()
    if (!wavBlob) {
      if (this.onError) this.onError('No audio recorded')
      if (this.onStateChange) this.onStateChange('idle')
      return
    }

    try {
      const result = await this.apiRecognize(wavBlob)
      const text = (result && result.text) || ''
      if (this.onTranscript) this.onTranscript(text)
    } catch (err) {
      if (this.onError) this.onError(err.message || 'Transcription failed')
    }

    this.chunks = []
    if (this.onStateChange) this.onStateChange('idle')
  }

  cancel() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.chunks = []
    if (this.onStateChange) this.onStateChange('idle')
  }

  _createWavBlob() {
    if (this.chunks.length === 0) return null

    const totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new ArrayBuffer(44 + totalLength * 2)
    const view = new DataView(buffer)

    this._writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + totalLength * 2, true)
    this._writeString(view, 8, 'WAVE')
    this._writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, NUM_CHANNELS, true)
    view.setUint32(24, SAMPLE_RATE, true)
    view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true)
    view.setUint16(32, NUM_CHANNELS * (BITS_PER_SAMPLE / 8), true)
    view.setUint16(34, BITS_PER_SAMPLE, true)
    this._writeString(view, 36, 'data')
    view.setUint32(40, totalLength * 2, true)

    let offset = 44
    for (const chunk of this.chunks) {
      for (let i = 0; i < chunk.length; i++) {
        const sample = Math.max(-1, Math.min(1, chunk[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  _writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }
}

export default VoiceRecorder
