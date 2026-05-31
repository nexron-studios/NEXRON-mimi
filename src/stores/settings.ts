import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'dark' | 'light'
export type Language = 'de' | 'en' | 'auto'

const STORAGE_KEY = 'mimi.settings'

interface PersistedSettings {
  theme: ThemeMode
  language: Language
  hasAutoCopy: boolean
  hotkey: string
}

const loadPersisted = (): Partial<PersistedSettings> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const persisted = loadPersisted()

  const theme = ref<ThemeMode>(persisted.theme ?? 'dark')
  const language = ref<Language>(persisted.language ?? 'auto')
  const hasAutoCopy = ref<boolean>(persisted.hasAutoCopy ?? true)
  const hotkey = ref<string>(persisted.hotkey ?? 'CommandOrControl+Shift+Space')

  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(
    [theme, language, hasAutoCopy, hotkey],
    () => {
      const data: PersistedSettings = {
        theme: theme.value,
        language: language.value,
        hasAutoCopy: hasAutoCopy.value,
        hotkey: hotkey.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      applyTheme()
    },
    { immediate: true }
  )

  return { theme, language, hasAutoCopy, hotkey, toggleTheme, applyTheme }
})
