<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

/**
 * Honest placeholder for routes that are planned but not built yet.
 * No fake forms, prices or bookings; the page is excluded from search indexing.
 */
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    eyebrow?: string
  }>(),
  { description: 'Страница готовится и скоро появится на сайте.', eyebrow: 'Раздел в разработке' },
)

useSeoMeta({ title: props.title, robots: 'noindex, follow' })
</script>

<template>
  <section class="container-page flex min-h-[60svh] flex-col justify-center py-20">
    <SectionHeading as="h1" :eyebrow="eyebrow" :title="title" :lead="description" />
    <div class="mt-10 flex flex-wrap gap-3">
      <BaseButton to="/" variant="secondary">
        <ArrowLeft class="size-4" :stroke-width="1.75" aria-hidden="true" />
        На главную
      </BaseButton>
      <slot name="actions" />
    </div>
  </section>
</template>
