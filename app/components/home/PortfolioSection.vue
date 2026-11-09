<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { portfolioCategoryLabels, portfolioPreview } from '~/config/portfolio'

/*
 * Editorial bento grid. Layout is positional (by index), content comes from config.
 * Mobile: 2 columns with fixed ratios. Tablet+: 4×2 grid, items fill their cells.
 */
const layout = [
  // Large lead shot
  'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto',
  'aspect-square md:aspect-auto',
  // Tall portrait
  'row-span-2 md:aspect-auto',
  'aspect-square md:aspect-auto',
]
</script>

<template>
  <section id="portfolio" class="section-y" aria-labelledby="portfolio-title">
    <div class="container-page">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          v-reveal
          eyebrow="Портфолио"
          title="Атмосфера ваших событий"
          heading-id="portfolio-title"
          lead="Живые эмоции, продуманный декор и снимки, к которым хочется возвращаться."
        />
        <BaseButton v-reveal to="/portfolio" variant="secondary" class="self-start md:self-auto">
          Смотреть портфолио
          <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
        </BaseButton>
      </div>

      <ul
        class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:mt-14 md:grid-cols-4 md:grid-rows-[repeat(2,clamp(13rem,22vw,18rem))] lg:gap-5"
      >
        <li
          v-for="(item, index) in portfolioPreview"
          :key="item.id"
          v-reveal="index * 90"
          class="relative"
          :class="layout[index]"
        >
          <figure class="group relative size-full">
            <PhotoFrame
              :image="item.image"
              ratio="fill"
              zoom-on-hover
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <figcaption
              class="absolute bottom-3 left-3 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-text shadow-(--shadow-soft)"
            >
              {{ portfolioCategoryLabels[item.category] }}
            </figcaption>
          </figure>
        </li>
      </ul>
    </div>
  </section>
</template>
