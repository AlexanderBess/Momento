
<script setup lang="ts">
import type { ImageAsset } from '~/types/service'

const heroImage: ImageAsset = {
  src: '/images/about/photobook-school.webp',
  alt: 'Фотокнига выпускного класса, созданная MOMENTO',
  width: 2000,
  height: 2000,
}
</script>

<template>
  <section class="section-y clip-x" aria-labelledby="about-hero-title">
    <div class="container-page">
      <div class="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12 lg:gap-20">
        <div class="flex flex-col items-start gap-6 md:py-8 lg:py-12">
          <p class="eyebrow motion-safe:animate-hero-enter">
            О студии MOMENTO
          </p>

          <h1
            id="about-hero-title"
            class="max-w-[11ch] font-display text-display motion-safe:animate-hero-rise"
          >
            Моменты проходят. Эмоции остаются.
          </h1>

          <p
            class="max-w-[29rem] text-lead text-muted motion-safe:animate-hero-enter motion-safe:[animation-delay:80ms]"
          >
            Мы — семейная креативная студия. Объединяем творчество и технологии,
            чтобы помогать сохранять важные моменты в фотографиях и вещах,
            к которым хочется возвращаться.
          </p>

          <p class="eyebrow text-muted-soft">
            MOMENTO · Новосибирск
          </p>
        </div>

        <div class="relative md:pl-2 lg:pl-4">
          <ClipReveal delay="180">
            <PhotoFrame
              :image="heroImage"
              ratio="1 / 1"
              sizes="640px sm:520px md:480px lg:600px"
              class="w-full"
              :rounded="false"
            />
          </ClipReveal>

          <p class="mt-3 text-right text-xs text-muted">
            Фотокнига · Один из способов сохранить историю
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
