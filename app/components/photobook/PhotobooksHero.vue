<script setup lang="ts">
import type { ImageAsset } from '~/types/service'

withDefaults(defineProps<{
  eyebrow: string
  title: string
  emphasis: string
  description: string
  image: ImageAsset
  tone?: 'neutral' | 'warm' | 'sage'
}>(), { tone: 'neutral' })

const headingId = useId()
</script>

<template>
  <section class="container-page py-9 sm:py-12 lg:py-16" :aria-labelledby="headingId">
    <div class="grid items-center gap-7 md:grid-cols-2 md:gap-10 lg:gap-14">
      <div class="flex min-w-0 flex-col items-start gap-4 sm:gap-5">
        <p class="eyebrow flex items-center gap-3">
          <span class="h-px w-6 shrink-0 bg-accent" aria-hidden="true" />
          {{ eyebrow }}
        </p>
        <h1
          :id="headingId"
          class="font-display text-[clamp(2.5rem,1.9rem+2.8vw,4.375rem)] leading-none tracking-[-0.015em] text-text wrap-break-word"
        >
          {{ title }} <em class="block text-accent italic">{{ emphasis }}</em>
        </h1>
        <p class="max-w-lg text-lead text-muted">{{ description }}</p>
        <div class="mt-1 flex flex-col items-start gap-3">
          <slot />
        </div>
      </div>
      <PhotobooksVisual
        :image="image"
        :tone="tone"
        ratio="3 / 2"
        sizes="530px lg:630px"
        class="rounded-card"
        priority
      />
    </div>
  </section>
</template>
