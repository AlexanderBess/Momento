<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    eyebrow?: string
    lead?: string
    /** Heading level — keeps document outline correct wherever the block is used. */
    as?: 'h1' | 'h2' | 'h3'
    align?: 'start' | 'center'
  }>(),
  { eyebrow: undefined, lead: undefined, as: 'h2', align: 'start' },
)
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-4" :class="align === 'center' && 'mx-auto items-center text-center'">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="font-display text-h2 text-text">
      <slot name="title">{{ title }}</slot>
    </component>
    <p v-if="lead" class="max-w-xl text-lead text-muted">{{ lead }}</p>
  </div>
</template>
