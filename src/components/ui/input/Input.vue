<script setup lang="ts">
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()

const model = defineModel<string>()
</script>

<template>
  <input
    v-model="model"
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-xs transition-colors',
        'placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        cls
      )
    "
  />
</template>
