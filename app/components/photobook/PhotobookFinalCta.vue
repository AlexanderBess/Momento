<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { createConfig } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

/* Closing block: a small stack of finished books instead of a photo (rendered, no stock imagery). */
const front: PhotobookConfig = createConfig('weddingStory')
const back: PhotobookConfig = { ...createConfig('littleMoments'), extras: { embossing: false, spineText: true } }
</script>

<template>
  <section class="section-y clip-x" aria-labelledby="photobook-cta-title">
    <div class="container-page">
      <div
        v-reveal
        class="relative isolate grid items-center gap-8 overflow-hidden rounded-[1.75rem] bg-[#ece5da] px-6 py-12 sm:px-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:py-16 lg:px-16"
      >
        <div
          class="pointer-events-none absolute top-1/2 right-[-10%] -z-10 size-[36rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.75),transparent)]"
          aria-hidden="true"
        />
        <div class="flex flex-col items-start gap-5">
          <p class="eyebrow">Фотокниги MOMENTO</p>
          <h2 id="photobook-cta-title" class="max-w-xl font-display text-h2">Сохраните то, к чему захочется вернуться</h2>
          <p class="max-w-md text-lead text-muted">
            Самые важные моменты заслуживают своего места не только в памяти, но и на страницах вашей фотокниги.
          </p>
          <BaseButton to="#studio" size="lg" class="mt-2">
            Создать свою фотокнигу
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>

        <div class="relative h-72 sm:h-80" aria-hidden="true">
          <div class="absolute inset-y-0 left-[4%] w-[62%] -rotate-6">
            <PhotobookCover :config="back" pose="spine" :fit="[0.7, 0.86]" sizes="220px" />
          </div>
          <div class="absolute inset-y-[6%] right-0 w-[64%] rotate-2">
            <PhotobookCover :config="front" :fit="[0.72, 0.86]" sizes="240px" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
