<script setup lang="ts">
import { computed } from 'vue'

const { level = 0, isActive = false } = defineProps<{
  level?: number
  isActive?: boolean
}>()

const bars = [0.45, 0.75, 1, 0.7, 0.4]

const heights = computed(() =>
  bars.map((weight) => {
    const value = isActive ? Math.max(0.12, Math.min(1, level * weight)) : 0.12
    return `${Math.round(value * 100)}%`
  })
)
</script>

<template>
  <div class="flex h-6 items-center justify-center gap-1">
    <span
      v-for="(height, index) in heights"
      :key="index"
      class="w-1.5 rounded-full bg-primary transition-[height] duration-100 ease-out"
      :class="{ 'bg-muted-foreground/40': !isActive }"
      :style="{ height }"
    />
  </div>
</template>
