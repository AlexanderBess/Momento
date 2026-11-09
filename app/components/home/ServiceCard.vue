<script setup lang="ts">
import { ArrowUpRight, Sparkles } from '@lucide/vue'
import type { Service } from '~/types/service'

withDefaults(
  defineProps<{
    service: Service
    /** Heading level inside the card, so the outline stays correct on any page. */
    headingLevel?: 'h2' | 'h3'
    sizes?: string
  }>(),
  { headingLevel: 'h3', sizes: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw' },
)
</script>

<template>
  <article class="group relative flex h-full flex-col gap-5">
    <div class="relative">
      <PhotoFrame :image="service.image" ratio="4 / 5" zoom-on-hover :sizes="sizes" />
      <span
        v-if="service.featured"
        class="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-accent shadow-(--shadow-soft)"
      >
        <Sparkles class="size-3.5" :stroke-width="2" aria-hidden="true" />
        AI
      </span>
    </div>

    <div class="flex items-start justify-between gap-4">
      <div>
        <component :is="headingLevel" class="font-display text-h3">
          <!-- Stretched link: the whole card is clickable, but only the title is announced. -->
          <NuxtLink :to="service.href" class="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent">
            {{ service.title }}
          </NuxtLink>
        </component>
        <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{{ service.summary }}</p>
      </div>
      <span
        class="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-text transition-[background-color,border-color,color,transform] duration-(--motion-normal) ease-standard group-hover:border-text group-hover:bg-text group-hover:text-bg group-has-focus-visible:border-accent"
        aria-hidden="true"
      >
        <ArrowUpRight
          class="size-4.5 transition-transform duration-(--motion-normal) ease-standard group-hover:translate-x-px group-hover:-translate-y-px"
          :stroke-width="1.75"
        />
      </span>
    </div>
  </article>
</template>
