<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Moon, Sun, Keyboard } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings'
import type { Language } from '@/stores/settings'

const { t, locale } = useI18n()

const settings = useSettingsStore()
const { theme, language, hasAutoCopy, hotkey } = storeToRefs(settings)

const uiLanguages = computed(() => [
  { value: 'de', label: 'DE' },
  { value: 'en', label: 'EN' },
])

const transcriptionLanguages = computed<{ value: Language; label: string }[]>(() => [
  { value: 'auto', label: t('settings.auto') },
  { value: 'de', label: t('settings.german') },
  { value: 'en', label: t('settings.english') },
])

const setUiLanguage = (value: string) => {
  locale.value = value
}

const prettyHotkey = computed(() =>
  hotkey.value.replace('CommandOrControl', 'Ctrl').replaceAll('+', ' + ')
)
</script>

<template>
  <ScrollArea class="h-full">
    <div class="flex flex-col gap-6 px-5 py-4">
      <section class="space-y-3">
        <h3 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('settings.appearance') }}
        </h3>

        <div class="flex items-center justify-between">
          <span class="text-sm">{{ t('settings.theme') }}</span>
          <div class="flex gap-1 rounded-lg bg-secondary p-0.5">
            <button
              type="button"
              :class="
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors',
                  theme === 'dark' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                )
              "
              @click="theme = 'dark'"
            >
              <Moon class="size-3.5" />
              {{ t('settings.dark') }}
            </button>
            <button
              type="button"
              :class="
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors',
                  theme === 'light' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                )
              "
              @click="theme = 'light'"
            >
              <Sun class="size-3.5" />
              {{ t('settings.light') }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm">{{ t('settings.language') }}</span>
          <div class="flex gap-1 rounded-lg bg-secondary p-0.5">
            <button
              v-for="lang in uiLanguages"
              :key="lang.value"
              type="button"
              :class="
                cn(
                  'rounded-md px-3 py-1 text-sm transition-colors',
                  locale === lang.value ? 'bg-card shadow-sm' : 'text-muted-foreground'
                )
              "
              @click="setUiLanguage(lang.value)"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('settings.transcription') }}
        </h3>

        <div class="flex items-center justify-between gap-3">
          <span class="text-sm">{{ t('settings.transcriptionLanguage') }}</span>
          <div class="flex gap-1 rounded-lg bg-secondary p-0.5">
            <button
              v-for="lang in transcriptionLanguages"
              :key="lang.value"
              type="button"
              :class="
                cn(
                  'rounded-md px-2.5 py-1 text-sm transition-colors',
                  language === lang.value ? 'bg-card shadow-sm' : 'text-muted-foreground'
                )
              "
              @click="language = lang.value"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <p class="text-sm">{{ t('settings.autoCopy') }}</p>
            <p class="text-xs text-muted-foreground">{{ t('settings.autoCopyHint') }}</p>
          </div>
          <Switch v-model="hasAutoCopy" />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <p class="flex items-center gap-1.5 text-sm">
              <Keyboard class="size-3.5" />
              {{ t('settings.hotkey') }}
            </p>
            <p class="text-xs text-muted-foreground">{{ t('settings.hotkeyHint') }}</p>
          </div>
          <Badge variant="secondary" class="font-mono">{{ prettyHotkey }}</Badge>
        </div>
      </section>

      <section class="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
        <span class="text-xs text-muted-foreground">{{ t('settings.about') }}</span>
        <Badge variant="outline">mimi v0.1.0</Badge>
      </section>
    </div>
  </ScrollArea>
</template>
