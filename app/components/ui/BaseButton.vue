<script setup lang="ts">
import { NuxtLink } from '#components'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** Internal route or external URL — renders a link. Without it, a <button>. */
    to?: string
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Stretch to full width (useful on mobile). */
    block?: boolean
  }>(),
  { to: undefined, variant: 'primary', size: 'md', type: 'button', disabled: false, block: false },
)

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:bg-accent-hover',
  secondary: 'bg-surface text-text ring-1 ring-inset ring-border hover:ring-text/40',
  ghost: 'bg-transparent text-text hover:bg-text/5',
}

const sizeClass: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[0.9375rem]',
}

const classes = computed(() => [
  'group/button inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-button font-semibold tracking-[0.01em]',
  'transition-[background-color,color,box-shadow,transform] duration-(--motion-normal) ease-standard',
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  variantClass[props.variant],
  sizeClass[props.size],
  props.block && 'w-full',
])
</script>

<template>
  <NuxtLink v-if="to && !disabled" :to="to" :class="classes">
    <slot />
    <span
      v-if="$slots.icon"
      class="inline-flex transition-transform duration-(--motion-normal) ease-standard group-hover/button:translate-x-0.5"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <slot />
    <span
      v-if="$slots.icon"
      class="inline-flex transition-transform duration-(--motion-normal) ease-standard group-hover/button:translate-x-0.5"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
  </button>
</template>
