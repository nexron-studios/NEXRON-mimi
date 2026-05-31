import { invoke } from '@tauri-apps/api/core'
import type { Transcript } from '@/types/transcript.type'

export const listTranscripts = (): Promise<Transcript[]> => invoke('list_transcripts')

export const saveTranscript = (
  text: string,
  language: string,
  durationMs: number
): Promise<Transcript> => invoke('save_transcript', { text, language, durationMs })

export const deleteTranscript = (id: number): Promise<void> =>
  invoke('delete_transcript', { id })

export const clearTranscripts = (): Promise<void> => invoke('clear_transcripts')
