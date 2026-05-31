<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Copy, Download, Loader2 } from 'lucide-vue-next'
import NxrMicButton from '@/components/NxrMicButton.vue'
import NxrLevelMeter from '@/components/NxrLevelMeter.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRecorderStore } from '@/stores/recorder'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()

const recorder = useRecorderStore()
const settings = useSettingsStore()
const { status, lastText, liveText, level, isModelReady, isModelDownloading, downloadPercent } =
  storeToRefs(recorder)

const isRecording = computed(() => status.value === 'recording')

const statusLabel = computed(() => {
  if (status.value === 'recording') return t('record.recording')
  if (status.value === 'transcribing') return t('record.transcribing')
  return t('record.idle')
})

const hint = computed(() =>
  status.value === 'recording'
    ? t('record.hintStop')
    : t('record.hintStart', { hotkey: settings.hotkey.replace('CommandOrControl', 'Ctrl') })
)
</script>

<template>
  <div class="flex h-full flex-col items-center justify-between px-6 py-4">
    <Transition name="fade" mode="out-in">
      <div
        v-if="!isModelReady"
        key="model"
        class="flex flex-1 items-center justify-center"
      >
        <Card class="max-w-sm border-white/10 bg-card/70 backdrop-blur-xl">
          <CardContent class="flex flex-col items-center gap-4 py-2 text-center">
            <div class="flex size-12 items-center justify-center rounded-full bg-primary/15">
              <Download class="size-6 text-primary" />
            </div>
            <div class="space-y-1">
              <h2 class="font-semibold">{{ t('model.title') }}</h2>
              <p class="text-sm text-muted-foreground">{{ t('model.description') }}</p>
            </div>
            <Button :disabled="isModelDownloading" class="w-full" @click="recorder.downloadModel">
              <Loader2 v-if="isModelDownloading" class="animate-spin" />
              {{
                isModelDownloading
                  ? t('model.downloading', { percent: downloadPercent })
                  : t('model.download')
              }}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div v-else key="record" class="flex flex-1 flex-col items-center justify-center gap-5">
        <div class="flex flex-col items-center gap-4">
          <NxrMicButton :status="status" @toggle="recorder.toggle" />
          <div class="text-center">
            <p class="text-lg font-medium">{{ statusLabel }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ hint }}</p>
          </div>
          <NxrLevelMeter v-if="isRecording" :level="level" :is-active="isRecording" />
        </div>

        <Transition name="slide-up">
          <Card
            v-if="isRecording"
            class="w-full max-w-md border-primary/30 bg-card/70 backdrop-blur-xl"
          >
            <CardContent class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="relative flex size-2">
                  <span
                    class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"
                  />
                  <span class="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <Badge variant="secondary" class="text-[10px]">{{ t('record.live') }}</Badge>
              </div>
              <div class="nxr-scroll max-h-24 pr-1">
                <p v-if="liveText" class="selectable text-sm leading-relaxed">
                  {{ liveText }}
                </p>
                <p v-else class="text-sm text-muted-foreground italic">
                  {{ t('record.listening') }}
                </p>
              </div>
            </CardContent>
          </Card>
        </Transition>
      </div>
    </Transition>

    <Transition name="slide-up">
      <Card
        v-if="lastText"
        class="w-full max-w-md shrink-0 border-white/10 bg-card/70 backdrop-blur-xl"
      >
        <CardContent class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {{ t('record.lastResult') }}
            </span>
            <Button size="sm" variant="ghost" @click="recorder.copyText(lastText)">
              <Copy class="size-3.5" />
              {{ t('record.copy') }}
            </Button>
          </div>
          <div class="nxr-scroll max-h-28 pr-1">
            <p class="selectable text-sm leading-relaxed">{{ lastText }}</p>
          </div>
        </CardContent>
      </Card>
    </Transition>
  </div>
</template>
