<script setup lang="ts">
const { size = 28, hasText = false } = defineProps<{
  size?: number
  hasText?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-2.5">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <rect x="13" y="4" width="6" height="14" rx="3" fill="currentColor" />
      <path
        d="M8 15a8 8 0 0 0 16 0"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <path d="M16 23v5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      <circle cx="16" cy="11" r="1.4" fill="var(--color-primary)" opacity="0.9" />
    </svg>
    <span v-if="hasText" class="text-base font-semibold tracking-tight text-white lowercase">
      mimi
    </span>
  </div>
</template>
