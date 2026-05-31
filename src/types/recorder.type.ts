export type RecorderStatus = 'idle' | 'recording' | 'transcribing' | 'error'

export interface ModelStatus {
  isReady: boolean
  name: string
  sizeMb: number
  path: string
}

export type ModelDownloadProgress = {
  downloadedBytes: number
  totalBytes: number
}
