<script setup lang="ts">
import { Minus, X } from 'lucide-vue-next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import NxrLogo from '@/components/NxrLogo.vue'

const minimize = () => getCurrentWindow().minimize()
const close = () => getCurrentWindow().close()
</script>

<template>
  <div
    data-tauri-drag-region
    class="flex h-10 shrink-0 items-center justify-between pr-1 pl-3"
  >
    <NxrLogo :size="20" has-text />
    <div class="flex items-center gap-0.5">
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        @click="minimize"
      >
        <Minus class="size-4" />
      </button>
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-destructive hover:text-white"
        @click="close"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</template>
