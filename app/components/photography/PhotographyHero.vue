<script setup lang="ts">
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { photographyHero } from '~/config/photography'

/*
 * Modern Editorial hero: a tall photo on the left, a large serif headline set on the right like a
 * magazine opener, a vertical index and a thin caption line. Deliberately unlike the home hero
 * (copy left / photo right) and the booth hero (dark stage with a collage).
 */


const media = useTemplateRef<HTMLElement>('media')
// Scroll parallax only for a real photo (it is slightly overscaled so the edges never show).
if (photographyHero.image.src) useParallax(media, 22)

const categories = ['Portraits', 'Love Stories', 'Family', 'Events', 'Business']
</script>

<template>
  <section id="photography-hero" class="clip-x -mt-(--header-height) bg-service-bg pt-(--header-height)" aria-labelledby="photo-hero-title">
    <div
      class="container-page grid gap-10 pt-6 pb-14 sm:pt-10 md:pb-20 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-x-8 lg:gap-y-10 lg:pt-12 lg:pb-12"
    >
      <!-- ---------- Top line ---------- -->
      <div
        class="flex items-center gap-4 border-b border-service-accent/25 pb-4 motion-safe:animate-hero-enter lg:col-span-12"
      >
        <p class="eyebrow text-text">MOMENTO / PHOTOGRAPHY</p>
        <span class="h-px flex-1 bg-transparent" aria-hidden="true" />
        <p class="eyebrow hidden sm:block" aria-hidden="true">Portraits · Love Stories · Events</p>
      </div>

      <!-- ---------- Copy (first in the DOM: the heading is the mobile LCP) ---------- -->
      <div class="flex flex-col gap-7 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:justify-center lg:gap-9 lg:pl-4">
        <h1 id="photo-hero-title" class="hero-title font-display motion-safe:animate-hero-rise">
          <span class="block">Истории,</span>
          <span class="block pl-[12%]">которые</span>
          <span class="block italic">остаются.</span>
        </h1>

        <div class="flex flex-col gap-7 motion-safe:animate-hero-enter motion-safe:[animation-delay:120ms] sm:flex-row sm:items-start sm:gap-10 lg:flex-col lg:gap-8">
          <span class="hidden h-px w-14 shrink-0 translate-y-3.5 bg-text sm:block lg:hidden" aria-hidden="true" />
          <p class="max-w-[26rem] text-lead text-muted">
            Сохраняем искренние эмоции, атмосферу и моменты, к которым хочется возвращаться.
          </p>
        </div>

        <div
          class="flex flex-col items-stretch gap-3 motion-safe:animate-hero-enter motion-safe:[animation-delay:200ms] sm:flex-row sm:items-center sm:gap-7"
        >
          <BaseButton to="#pricing" size="lg" class="sm:w-auto">
            Подобрать съёмку
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
          <NuxtLink
            to="#formats"
            class="group inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold underline-offset-[6px] hover:underline"
          >
            Наши форматы
            <ArrowDown
              class="size-4 transition-transform duration-(--motion-normal) ease-standard group-hover:translate-y-0.5"
              :stroke-width="2"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- ---------- Photo ---------- -->
      <figure class="relative lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-center">
        <div class="relative mx-auto max-w-[30rem] lg:mr-6 lg:max-w-none">
          <!-- Vertical editorial index along the photo -->
          <p
            class="pointer-events-none absolute top-0 -right-7 hidden origin-top-left translate-x-full rotate-90 text-[0.6875rem] font-semibold tracking-[0.24em] whitespace-nowrap text-muted uppercase lg:block"
            aria-hidden="true"
          >
            01 / Photography
          </p>

          <div ref="media" class="hero-media overflow-hidden rounded-card" :class="photographyHero.image.src && 'has-photo'">
            <div class="hero-media-inner">
              <PhotographyFrame
                :image="photographyHero.image"
                ratio="4 / 5"
                priority
                index="01"
                sizes="480px sm:480px lg:520px"
              />
            </div>
          </div>
        </div>
        <figcaption
          class="mx-auto mt-3 flex max-w-[30rem] items-center justify-between gap-4 text-xs text-muted lg:mr-6 lg:max-w-none"
        >
          <span class="font-display text-base italic">Fig. 01</span>
          <span class="eyebrow tracking-[0.16em]">{{ photographyHero.caption }}</span>
        </figcaption>
      </figure>

      <!-- ---------- Bottom index ---------- -->
      <ul
        class="no-scrollbar -mx-(--gutter) flex gap-6 overflow-x-auto border-t border-border px-(--gutter) pt-4 motion-safe:animate-hero-enter motion-safe:[animation-delay:360ms] sm:mx-0 sm:justify-between sm:px-0 lg:col-span-12 lg:row-start-3"
        aria-label="Направления съёмки"
      >
        <li
          v-for="(category, i) in categories"
          :key="category"
          class="flex shrink-0 items-baseline gap-2 text-sm text-muted"
        >
          <span class="font-display text-base text-text italic" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ category }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero-title {
  font-size: clamp(3.25rem, 1.9rem + 6.6vw, 7.25rem);
  line-height: 0.95;
  letter-spacing: -0.02em;
}

/* Scale-in of the photo frame; `scale` and `translate` are separate properties, so the scroll
   parallax (translate) never fights the entrance (scale). The frame is never transparent (LCP). */
@media (prefers-reduced-motion: no-preference) {
  .hero-media-inner {
    animation: hero-photo-in 1200ms var(--ease-enter) both;
  }
}

.hero-media.has-photo .hero-media-inner {
  scale: 1.06;
  translate: 0 var(--parallax-y, 0);
}

@keyframes hero-photo-in {
  from {
    scale: 1.05;
  }
}

.hero-media.has-photo .hero-media-inner {
  animation-name: hero-photo-in-overscaled;
}

@keyframes hero-photo-in-overscaled {
  from {
    scale: 1.12;
  }
}
</style>
