<script setup lang="ts">
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()
</script>

<template>
  <div
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-5 shadow-sm',
        cls
      )
    "
  >
    <slot />
  </div>
</template>
