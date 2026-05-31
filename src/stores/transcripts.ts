import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import type { Transcript } from '@/types/transcript.type'
import {
  clearTranscripts,
  deleteTranscript,
  listTranscripts,
  saveTranscript,
} from '@/services/history.service'

export const useTranscriptsStore = defineStore('transcripts', () => {
  const items = ref<Transcript[]>([])
  const query = ref('')
  const isLoading = ref(false)

  const fuse = computed(
    () =>
      new Fuse(items.value, {
        keys: ['text'],
        threshold: 0.4,
        ignoreLocation: true,
      })
  )

  const filtered = computed<Transcript[]>(() => {
    const term = query.value.trim()
    if (!term) return items.value
    return fuse.value.search(term).map((result) => result.item)
  })

  const load = async () => {
    isLoading.value = true
    try {
      items.value = await listTranscripts()
    } finally {
      isLoading.value = false
    }
  }

  const add = async (text: string, language: string, durationMs: number) => {
    const saved = await saveTranscript(text, language, durationMs)
    items.value = [saved, ...items.value]
    return saved
  }

  const remove = async (id: number) => {
    await deleteTranscript(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  const clear = async () => {
    await clearTranscripts()
    items.value = []
  }

  return { items, query, isLoading, filtered, load, add, remove, clear }
})
