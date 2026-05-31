<script setup lang="ts">
import { Separator, type SeparatorProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const {
  orientation = 'horizontal',
  decorative = true,
  class: cls,
} = defineProps<SeparatorProps & { class?: string }>()
</script>

<template>
  <Separator
    :orientation
    :decorative
    :class="
      cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        cls
      )
    "
  />
</template>
