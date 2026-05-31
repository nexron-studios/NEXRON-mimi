<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '@/lib/utils'

const {
  variant,
  size,
  as = 'button',
  class: cls,
} = defineProps<
  PrimitiveProps & {
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: string
  }
>()
</script>

<template>
  <Primitive
    :as
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), cls)"
  >
    <slot />
  </Primitive>
</template>
