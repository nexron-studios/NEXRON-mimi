import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import type { ModelStatus, ModelDownloadProgress } from '@/types/recorder.type'

export const getModelStatus = (): Promise<ModelStatus> => invoke('get_model_status')

export const downloadModel = (): Promise<void> => invoke('download_model')

export const onModelDownloadProgress = (
  handler: (progress: ModelDownloadProgress) => void
): Promise<UnlistenFn> =>
  listen<ModelDownloadProgress>('model-download', (event) => handler(event.payload))

export const transcribe = (pcm: Float32Array, language: string): Promise<string> =>
  invoke('transcribe', { pcm: Array.from(pcm), language })
