<script setup lang="ts">
import { ArrowRight, MapPin } from '@lucide/vue'
import type { ImageAsset } from '~/types/service'

// Replace `src: null` with real photos from /public/images/hero (see docs/IMAGES.md).

const section = useTemplateRef<HTMLElement>('section')
// The glow keeps drifting only while the hero is on screen.
const { isInView } = useInView(section, { initial: true })
const heroImage: ImageAsset = { src: null, alt: 'Эмоциональный момент праздника', width: 1200, height: 1500 }
const detailImage: ImageAsset = { src: null, alt: 'Деталь праздничного декора', width: 800, height: 1000 }
</script>

<template>
  <section ref="section" class="relative clip-x" :class="!isInView && 'motion-paused'" aria-labelledby="hero-title">
    <!-- Soft accent glow: a pre-blurred radial gradient moved with transform only. -->
    <div
      class="pointer-events-none absolute top-[-12rem] right-[-30%] size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.18),transparent)] will-change-transform motion-safe:animate-glow-drift md:right-[-10%] md:size-[46rem]"
      aria-hidden="true"
    />

    <div
      class="container-page relative grid items-center gap-10 pt-8 pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12 md:pt-12 md:pb-20 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-16"
    >
      <!--
        Copy. The h1 is the LCP element on mobile, so it only rises (transform) and is never
        transparent — an opacity fade would delay LCP. Supporting lines fade in with a short stagger.
      -->
      <div class="flex flex-col items-start gap-6 md:gap-7">
        <p class="eyebrow flex items-center gap-3 motion-safe:animate-hero-enter">
          <span class="h-px w-8 bg-accent" aria-hidden="true" />
          Фото · Эмоции · Праздник
        </p>

        <h1 id="hero-title" class="font-display text-display motion-safe:animate-hero-rise">
          Сохраняем <em class="font-display text-accent italic">главное</em>
        </h1>

        <p class="max-w-[30rem] text-lead text-muted motion-safe:animate-hero-enter motion-safe:[animation-delay:80ms]">
          Фотосъёмка, фотозоны, фотобудки и фотокниги для ваших особенных событий
        </p>

        <div
          class="mt-2 flex w-full flex-col gap-3 motion-safe:animate-hero-enter motion-safe:[animation-delay:160ms] sm:w-auto sm:flex-row md:flex-col lg:flex-row"
        >
          <BaseButton to="/#services" size="lg" block class="sm:w-auto md:w-full lg:w-auto">
            Выбрать услуги
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
          <BaseButton to="/#benefits" size="lg" variant="secondary" block class="sm:w-auto md:w-full lg:w-auto">Узнать больше</BaseButton>
        </div>
      </div>

      <!-- Visual -->
      <div class="relative mx-auto w-full max-w-[34rem] md:mr-0 md:max-w-none">
        <!-- Thin decorative ring -->
        <div
          class="pointer-events-none absolute -top-6 -right-4 size-28 rounded-full border border-accent/30 motion-safe:animate-float-slow md:-top-8 md:-right-8 md:size-40"
          aria-hidden="true"
        />

        <PhotoFrame
          :image="heroImage"
          ratio="4 / 5"
          priority
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 45vw, (min-width: 640px) 544px, 100vw"
          :rounded="false"
          class="rounded-modal"
        />

        <!-- Overlapping detail shot (desktop only: too cramped next to the chip on tablet) -->
        <div
          class="absolute bottom-10 -left-6 hidden w-[34%] -rotate-3 rounded-card bg-surface p-2 shadow-(--shadow-raised) lg:block lg:-left-14"
          aria-hidden="true"
        >
          <PhotoFrame :image="detailImage" ratio="4 / 5" sizes="200px" :rounded="false" class="rounded-[0.625rem]" />
        </div>

        <p
          class="absolute right-3 bottom-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-surface/95 px-3.5 py-2 text-xs font-medium text-text shadow-(--shadow-soft) md:right-5 md:bottom-5"
        >
          <MapPin class="size-3.5 shrink-0 text-accent" :stroke-width="2" aria-hidden="true" />
          <span class="truncate">Выезд по Новосибирску и области</span>
        </p>
      </div>
    </div>
  </section>
</template>
