<script setup lang="ts">
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()
</script>

<template>
  <ScrollAreaRoot :class="cn('relative overflow-hidden', cls)" style="--scrollbar-size: 8px">
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      orientation="vertical"
      class="flex touch-none select-none p-0.5 transition-colors duration-150 data-[orientation=vertical]:w-2.5"
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
