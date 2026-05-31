<script setup lang="ts">
import { computed } from 'vue'
import { Mic, Square, Loader2 } from 'lucide-vue-next'
import type { RecorderStatus } from '@/types/recorder.type'
import { cn } from '@/lib/utils'

const { status, disabled = false } = defineProps<{
  status: RecorderStatus
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const isRecording = computed(() => status === 'recording')
const isTranscribing = computed(() => status === 'transcribing')
</script>

<template>
  <button
    type="button"
    :disabled="disabled || isTranscribing"
    :class="
      cn(
        'group relative flex size-32 items-center justify-center rounded-full transition-all duration-300 outline-none',
        'focus-visible:ring-4 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60',
        isRecording
          ? 'bg-destructive text-destructive-foreground shadow-[0_0_50px_-4px] shadow-destructive/60'
          : 'bg-primary text-primary-foreground shadow-[0_0_46px_-6px] shadow-primary/50 hover:scale-[1.04] active:scale-95'
      )
    "
    @click="emit('toggle')"
  >
    <span
      v-if="isRecording"
      class="absolute inset-0 animate-ping rounded-full bg-destructive/40"
    />
    <Loader2 v-if="isTranscribing" class="size-12 animate-spin" />
    <Square v-else-if="isRecording" class="size-11" fill="currentColor" />
    <Mic v-else class="size-12" />
  </button>
</template>
