<script setup lang="ts">
import { cn } from '@/lib/utils'

const { class: cls } = defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('flex items-center px-5', cls)">
    <slot />
  </div>
</template>
