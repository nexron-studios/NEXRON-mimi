<script setup lang="ts">
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()
</script>

<template>
  <p :class="cn('text-muted-foreground text-sm', cls)">
    <slot />
  </p>
</template>
