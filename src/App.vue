<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { getCurrentWindow } from '@tauri-apps/api/window'
import NxrBackground from '@/components/NxrBackground.vue'
import NxrTitlebar from '@/components/NxrTitlebar.vue'
import NxrNav from '@/components/NxrNav.vue'
import { useRecorderStore } from '@/stores/recorder'
import { useTranscriptsStore } from '@/stores/transcripts'
import { useSettingsStore } from '@/stores/settings'
import { isTauri } from '@/utils/tauri'

const recorder = useRecorderStore()
const transcripts = useTranscriptsStore()
const settings = useSettingsStore()

const handleHotkey = async () => {
  const appWindow = getCurrentWindow()
  await appWindow.show()
  await appWindow.setFocus()
  await recorder.toggle()
}

const registerHotkey = async (shortcut: string) => {
  if (!isTauri()) return
  try {
    await register(shortcut, (event) => {
      if (event.state === 'Pressed') handleHotkey()
    })
  } catch {
    // shortcut already registered or unsupported
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && recorder.status === 'recording') {
    event.preventDefault()
    recorder.cancel()
  }
}

watch(
  () => settings.hotkey,
  async (next, prev) => {
    if (prev) await unregister(prev).catch(() => {})
    await registerHotkey(next)
  }
)

onMounted(async () => {
  settings.applyTheme()
  window.addEventListener('keydown', handleKeydown)
  if (!isTauri()) return
  await Promise.all([recorder.refreshModelStatus(), transcripts.load()])
  await registerHotkey(settings.hotkey)
})

onUnmounted(async () => {
  window.removeEventListener('keydown', handleKeydown)
  if (!isTauri()) return
  await unregister(settings.hotkey).catch(() => {})
})
</script>

<template>
  <NxrBackground />
  <div class="flex h-screen w-screen flex-col">
    <NxrTitlebar />
    <main class="relative min-h-0 flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <NxrNav />
  </div>
  <Toaster position="top-center" theme="dark" :duration="1600" rich-colors />
</template>
