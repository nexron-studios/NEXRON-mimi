<script setup lang="ts">
import { type BadgeVariants, badgeVariants } from '.'
import { cn } from '@/lib/utils'

const { variant, class: cls } = defineProps<{
  variant?: BadgeVariants['variant']
  class?: string
}>()
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), cls)">
    <slot />
  </span>
</template>
