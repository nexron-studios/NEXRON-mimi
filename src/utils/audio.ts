const TARGET_SAMPLE_RATE = 16_000

const resampleTo16k = (input: Float32Array, inputRate: number): Float32Array => {
  if (inputRate === TARGET_SAMPLE_RATE) return input
  const ratio = inputRate / TARGET_SAMPLE_RATE
  const outLength = Math.floor(input.length / ratio)
  const output = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio
    const left = Math.floor(pos)
    const right = Math.min(left + 1, input.length - 1)
    const frac = pos - left
    output[i] = input[left] * (1 - frac) + input[right] * frac
  }
  return output
}

/**
 * Captures microphone audio as a continuously growing mono PCM buffer at
 * (ideally) 16 kHz. The live buffer can be read at any time via getPcm16k()
 * to feed interim transcriptions while recording is still in progress.
 */
export class AudioRecorder {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private processor: ScriptProcessorNode | null = null
  private chunks: Float32Array[] = []
  private totalLength = 0
  private sampleRate = TARGET_SAMPLE_RATE
  private startedAt = 0

  onLevel?: (level: number) => void

  get isRecording() {
    return this.ctx !== null
  }

  start = async () => {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.ctx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
    this.sampleRate = this.ctx.sampleRate
    this.source = this.ctx.createMediaStreamSource(this.stream)
    this.processor = this.ctx.createScriptProcessor(4096, 1, 1)
    this.chunks = []
    this.totalLength = 0

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      this.chunks.push(new Float32Array(input))
      this.totalLength += input.length

      if (this.onLevel) {
        let sum = 0
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
        const rms = Math.sqrt(sum / input.length)
        this.onLevel(Math.min(1, rms * 4))
      }
    }

    // Routing through destination keeps the processor firing; the processor's
    // output buffer stays silent, so the mic is not played back.
    this.source.connect(this.processor)
    this.processor.connect(this.ctx.destination)
    this.startedAt = performance.now()
  }

  /** Snapshot of everything recorded so far, resampled to 16 kHz mono. */
  getPcm16k = (): Float32Array => {
    const merged = new Float32Array(this.totalLength)
    let offset = 0
    for (const chunk of this.chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    return resampleTo16k(merged, this.sampleRate)
  }

  get durationMs() {
    return Math.round(performance.now() - this.startedAt)
  }

  stop = async (): Promise<{ pcm: Float32Array; durationMs: number }> => {
    const pcm = this.getPcm16k()
    const durationMs = this.durationMs
    await this.teardown()
    return { pcm, durationMs }
  }

  cancel = async () => {
    await this.teardown()
  }

  private teardown = async () => {
    this.processor?.disconnect()
    this.source?.disconnect()
    this.stream?.getTracks().forEach((track) => track.stop())
    if (this.ctx && this.ctx.state !== 'closed') await this.ctx.close()
    this.processor = null
    this.source = null
    this.stream = null
    this.ctx = null
    this.chunks = []
    this.totalLength = 0
    this.onLevel?.(0)
  }
}
