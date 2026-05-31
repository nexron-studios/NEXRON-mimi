<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Mic, History, Settings } from 'lucide-vue-next'

const { t } = useI18n()

const tabs = computed(() => [
  { to: '/', icon: Mic, label: t('nav.record') },
  { to: '/history', icon: History, label: t('nav.history') },
  { to: '/settings', icon: Settings, label: t('nav.settings') },
])
</script>

<template>
  <nav
    class="flex shrink-0 items-center justify-around border-t border-border bg-card px-2 py-1.5 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.45)]"
  >
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-muted-foreground transition-colors hover:text-foreground"
      active-class="!text-primary"
    >
      <component :is="tab.icon" class="size-5" />
      <span class="text-[11px] font-medium">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
