import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { toast } from 'vue-sonner'
import type { ModelStatus, RecorderStatus } from '@/types/recorder.type'
import { AudioRecorder } from '@/utils/audio'
import {
  downloadModel as downloadModelCmd,
  getModelStatus,
  onModelDownloadProgress,
  transcribe,
} from '@/services/transcription.service'
import { useTranscriptsStore } from '@/stores/transcripts'
import { useSettingsStore } from '@/stores/settings'
import { t } from '@/i18n'

const PARTIAL_INTERVAL_MS = 800
const MIN_PARTIAL_SAMPLES = 16_000 * 0.6

export const useRecorderStore = defineStore('recorder', () => {
  const status = ref<RecorderStatus>('idle')
  const lastText = ref('')
  const liveText = ref('')
  const level = ref(0)
  const modelStatus = ref<ModelStatus | null>(null)
  const isModelDownloading = ref(false)
  const downloadPercent = ref(0)

  const recorder = new AudioRecorder()
  recorder.onLevel = (value) => {
    level.value = value
  }

  let partialTimer: ReturnType<typeof setTimeout> | null = null
  let isPartialRunning = false

  const isBusy = computed(() => status.value === 'recording' || status.value === 'transcribing')
  const isModelReady = computed(() => modelStatus.value?.isReady ?? false)

  const stopPartialLoop = () => {
    if (partialTimer) clearTimeout(partialTimer)
    partialTimer = null
  }

  const startPartialLoop = (language: string) => {
    stopPartialLoop()
    partialTimer = setTimeout(async () => {
      if (status.value !== 'recording') return
      if (!isPartialRunning) {
        const pcm = recorder.getPcm16k()
        if (pcm.length >= MIN_PARTIAL_SAMPLES) {
          isPartialRunning = true
          try {
            const text = (await transcribe(pcm, language)).trim()
            if (status.value === 'recording') liveText.value = text
          } catch {
            // interim failures are non-fatal
          } finally {
            isPartialRunning = false
          }
        }
      }
      if (status.value === 'recording') startPartialLoop(language)
    }, PARTIAL_INTERVAL_MS)
  }

  const refreshModelStatus = async () => {
    modelStatus.value = await getModelStatus()
  }

  const downloadModel = async () => {
    if (isModelDownloading.value) return
    isModelDownloading.value = true
    downloadPercent.value = 0
    const unlisten = await onModelDownloadProgress(({ downloadedBytes, totalBytes }) => {
      downloadPercent.value = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0
    })
    try {
      await downloadModelCmd()
      await refreshModelStatus()
      toast.success(t('model.ready'))
    } catch {
      toast.error(t('model.failed'))
    } finally {
      unlisten()
      isModelDownloading.value = false
    }
  }

  const writeClipboard = (text: string) => writeText(text)

  const copyText = async (text: string) => {
    await writeClipboard(text)
    toast.success(t('record.copied'))
  }

  const start = async () => {
    if (isBusy.value || !isModelReady.value) return
    const settings = useSettingsStore()
    try {
      liveText.value = ''
      await recorder.start()
      status.value = 'recording'
      startPartialLoop(settings.language)
    } catch {
      status.value = 'error'
      toast.error(t('record.micDenied'))
    }
  }

  const stop = async () => {
    if (status.value !== 'recording') return
    const settings = useSettingsStore()
    const transcripts = useTranscriptsStore()
    stopPartialLoop()

    const interim = liveText.value.trim()

    // If the live preview already produced text, that IS the result: show it
    // instantly and copy it. A final pass runs silently in the background only
    // to recover the very last word(s) the last live tick may have missed.
    if (interim) {
      lastText.value = interim
      liveText.value = ''
      level.value = 0
      status.value = 'idle'
      if (settings.hasAutoCopy) await copyText(interim)

      try {
        const { pcm, durationMs } = await recorder.stop()
        const finalText = (await transcribe(pcm, settings.language)).trim()
        const best = finalText || interim
        lastText.value = best
        await transcripts.add(best, settings.language, durationMs)
        if (settings.hasAutoCopy && best !== interim) await writeClipboard(best)
      } catch {
        await transcripts.add(interim, settings.language, recorder.durationMs)
      }
      return
    }

    // No live text yet (very short clip): do a single quick transcription.
    status.value = 'transcribing'
    try {
      const { pcm, durationMs } = await recorder.stop()
      const text = (await transcribe(pcm, settings.language)).trim()
      lastText.value = text
      liveText.value = ''
      level.value = 0
      if (text) {
        await transcripts.add(text, settings.language, durationMs)
        if (settings.hasAutoCopy) await copyText(text)
      }
      status.value = 'idle'
    } catch {
      status.value = 'error'
      toast.error(t('record.failed'))
    }
  }

  const cancel = async () => {
    if (status.value !== 'recording') return
    stopPartialLoop()
    await recorder.cancel()
    liveText.value = ''
    level.value = 0
    status.value = 'idle'
    toast(t('record.cancelled'))
  }

  const toggle = async () => {
    if (status.value === 'recording') await stop()
    else await start()
  }

  return {
    status,
    lastText,
    liveText,
    level,
    modelStatus,
    isModelDownloading,
    downloadPercent,
    isBusy,
    isModelReady,
    refreshModelStatus,
    downloadModel,
    copyText,
    start,
    stop,
    cancel,
    toggle,
  }
})
