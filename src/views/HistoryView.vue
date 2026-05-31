<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { Search, Copy, Trash2, Clock, Inbox } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'vue-sonner'
import { useTranscriptsStore } from '@/stores/transcripts'
import { useRecorderStore } from '@/stores/recorder'
import type { Transcript } from '@/types/transcript.type'

const { t, locale } = useI18n()

const transcripts = useTranscriptsStore()
const recorder = useRecorderStore()
const { query, filtered, items } = storeToRefs(transcripts)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))

const remove = async (item: Transcript) => {
  await transcripts.remove(item.id)
  toast.success(t('history.deleted'))
}

const clearAll = async () => {
  await transcripts.clear()
  toast.success(t('history.cleared'))
}
</script>

<template>
  <div class="flex h-full flex-col gap-3 px-5 py-4">
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search class="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="query" :placeholder="t('history.search')" class="pl-8" />
      </div>
      <Button
        variant="outline"
        size="icon"
        :disabled="!items.length"
        :title="t('history.clear')"
        @click="clearAll"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>

    <ScrollArea class="-mr-2 flex-1 pr-2">
      <TransitionGroup name="list" tag="div" class="flex flex-col gap-2">
        <div
          v-for="item in filtered"
          :key="item.id"
          class="group rounded-lg border border-white/10 bg-card/60 p-3 backdrop-blur-sm"
        >
          <p class="selectable text-sm leading-relaxed">{{ item.text }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock class="size-3" />
              {{ formatDate(item.createdAt) }}
            </span>
            <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                class="size-7"
                :title="t('history.copy')"
                @click="recorder.copyText(item.text)"
              >
                <Copy class="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                class="size-7 hover:text-destructive"
                :title="t('history.delete')"
                @click="remove(item)"
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div
        v-if="!filtered.length"
        class="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground"
      >
        <Inbox class="size-8 opacity-50" />
        <p class="text-sm">{{ t('history.empty') }}</p>
      </div>
    </ScrollArea>
  </div>
</template>
