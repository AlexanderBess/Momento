<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { brand } from '~/config/brand'
import { services } from '~/config/services'

/*
 * Temporary Phase 1 home page: verifies tokens, fonts, buttons, PhotoFrame and v-reveal.
 * It is replaced by the full section composition (Hero, Services, AI booth…) in Phase 2.
 */
useSeoMeta({
  description: brand.description,
  ogTitle: `${brand.name} — ${brand.tagline}`,
  ogDescription: brand.description,
})
</script>

<template>
  <div>
    <section class="relative clip-x">
      <div
        class="pointer-events-none absolute -top-40 right-[-20%] size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.16),transparent)] motion-safe:animate-glow-drift"
        aria-hidden="true"
      />
      <div class="container-page relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div class="flex flex-col gap-6 motion-safe:animate-hero-enter">
          <p class="eyebrow">Фото · Эмоции · Праздник</p>
          <h1 class="font-display text-display">{{ brand.tagline }}</h1>
          <p class="max-w-md text-lead text-muted">
            Фотосъёмка, фотозоны, фотобудки и фотокниги для ваших особенных событий
          </p>
          <div class="mt-2 flex flex-col gap-3 sm:flex-row">
            <BaseButton to="/services" size="lg">
              Выбрать услуги
              <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
            </BaseButton>
            <BaseButton to="/about" size="lg" variant="secondary">Узнать больше</BaseButton>
          </div>
        </div>
        <PhotoFrame
          :image="{ src: null, alt: 'Эмоциональный кадр с праздника', width: 1200, height: 1400 }"
          ratio="6 / 7"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </section>

    <section class="container-page section-y">
      <SectionHeading title="Всё для ярких моментов" />
      <ul class="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(service, index) in services" :key="service.slug" v-reveal="index * 80">
          <NuxtLink :to="service.href" class="group flex flex-col gap-4">
            <PhotoFrame
              :image="service.image"
              ratio="4 / 5"
              zoom-on-hover
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <span class="font-display text-h3">{{ service.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
