<script setup lang="ts">
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { photozoneConcepts, photozonesHero } from '~/config/photozones'

/*
 * Photo zones hero: a sage «room» — the whole first screen sits on the mist tint, so the visitor
 * immediately sees they are in another section of the site. Copy on the left, a tall visual on the
 * right with a smaller second frame overlapping it (asymmetric, editorial). Header stays untouched.
 */
const secondary = photozoneConcepts[1]!.gallery[0]!
</script>

<template>
  <!-- Pulled up under the (transparent at the top) header, so the sage tint starts at the very top. -->
  <section
    id="photozones-hero"
    class="clip-x -mt-(--header-height) bg-service-bg pt-(--header-height)"
    aria-labelledby="pz-hero-title"
  >
    <div
      class="container-page grid gap-12 pt-8 pb-16 sm:pt-12 md:pb-20 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-x-8 lg:gap-y-10 lg:pt-10 lg:pb-10"
    >
      <!-- ---------- Top line ---------- -->
      <div class="flex items-center gap-4 border-b border-service-accent/25 pb-4 motion-safe:animate-hero-enter lg:col-span-12">
        <p class="eyebrow text-text">MOMENTO / PHOTO ZONES</p>
        <span class="h-px flex-1" aria-hidden="true" />
        <p class="eyebrow hidden text-(--color-accent) sm:block">Аренда · Доставка · Монтаж</p>
      </div>

      <!-- ---------- Copy ---------- -->
      <div class="flex flex-col justify-center gap-8 lg:col-span-6 lg:row-start-2 lg:gap-10">
        <h1 id="pz-hero-title" class="hero-title font-display motion-safe:animate-hero-rise">
          Пространство <span class="block">для <em class="text-(--color-accent) italic">особенных</em></span>
          <span class="block">моментов</span>
        </h1>

        <p class="max-w-[30rem] text-lead text-muted motion-safe:animate-hero-enter motion-safe:[animation-delay:120ms]">
          Создаём фотозоны для свадеб, дней рождения и других событий. Готовые концепции и индивидуальные решения с
          доставкой и установкой под ключ.
        </p>

        <div class="flex flex-col gap-3 motion-safe:animate-hero-enter motion-safe:[animation-delay:200ms] sm:flex-row sm:items-center sm:gap-4">
          <BaseButton to="#collection" size="lg">
            Смотреть фотозоны
            <template #icon><ArrowDown class="size-4" :stroke-width="2" /></template>
          </BaseButton>
          <BaseButton to="#custom" size="lg" variant="ghost" class="ring-1 ring-service-accent/35 ring-inset hover:bg-bg/60">
            Создать свою
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>
      </div>

      <!-- ---------- Visuals ---------- -->
      <div class="relative lg:col-span-6 lg:row-start-2 lg:self-center">
        <figure class="relative ml-auto w-[88%] max-w-[34rem] lg:w-[86%]">
          <div class="hero-media">
            <PhotozoneVisual :asset="photozonesHero.visual" ratio="4 / 5" priority sizes="480px sm:520px lg:540px" />
          </div>
          <figcaption class="mt-3 flex items-center justify-between gap-4 text-xs text-muted">
            <span class="font-display text-base italic">Fig. 01</span>
            <span class="eyebrow tracking-[0.16em]">{{ photozonesHero.caption }}</span>
          </figcaption>
        </figure>
        <div
          class="absolute bottom-[14%] left-0 w-[38%] max-w-[13rem] rounded-card shadow-(--shadow-raised) ring-6 ring-service-bg motion-safe:animate-hero-enter motion-safe:[animation-delay:320ms]"
          aria-hidden="true"
        >
          <PhotozoneVisual :asset="secondary" ratio="3 / 4" :label="false" sizes="220px" />
        </div>
      </div>

      <!-- ---------- Bottom index ---------- -->
      <ul
        class="no-scrollbar -mx-(--gutter) flex gap-6 overflow-x-auto border-t border-service-accent/25 px-(--gutter) pt-4 motion-safe:animate-hero-enter motion-safe:[animation-delay:360ms] sm:mx-0 sm:justify-between sm:px-0 lg:col-span-12 lg:row-start-3"
        aria-label="Для каких событий"
      >
        <li
          v-for="(label, i) in ['Свадьбы', 'Дни рождения', 'Детские праздники', 'Корпоративы', 'Частные события']"
          :key="label"
          class="flex shrink-0 items-baseline gap-2 text-sm text-muted"
        >
          <span class="font-display text-base text-text italic" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ label }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero-title {
  font-size: clamp(3rem, 1.8rem + 5.6vw, 6.5rem);
  line-height: 0.98;
  letter-spacing: -0.02em;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-media {
    animation: hero-photo-in 1200ms var(--ease-enter) both;
  }
}

@keyframes hero-photo-in {
  from {
    scale: 1.04;
  }
}
</style>
