export interface Transcript {
  id: number
  text: string
  language: string
  durationMs: number
  createdAt: string
}

export interface NewTranscript {
  text: string
  language: string
  durationMs: number
}
