<script setup lang="ts">
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()
</script>

<template>
  <h3 :class="cn('leading-none font-semibold tracking-tight', cls)">
    <slot />
  </h3>
</template>
