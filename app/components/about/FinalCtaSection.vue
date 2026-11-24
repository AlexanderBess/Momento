
<script setup lang="ts">
import { primaryCta } from '~/config/navigation'
import type { ImageAsset } from '~/types/service'

const ctaImage: ImageAsset = {
  src: '/images/about/photobook-kaliningrad.webp',
  alt: 'Фотокнига «Калининград. В поисках янтаря»',
  width: 1023,
  height: 998,
}
</script>

<template>
  <section
    class="section-y clip-x relative"
    aria-labelledby="about-cta-title"
  >
    <div class="container-page">
      <div class="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-16 lg:gap-24">
        <div class="order-2 md:order-1">
          <ClipReveal :delay="180">
            <PhotoFrame
              :image="ctaImage"
              ratio="1 / 1"
              sizes="640px sm:520px md:480px lg:560px"
              class="w-full"
              :rounded="false"
            />
          </ClipReveal>
          <p class="mt-3 text-xs text-muted">
            Фотокнига · История, сохранённая на страницах
          </p>
        </div>

        <div class="order-1 md:order-2">
          <SectionHeading
            v-reveal
            as="h2"
            title="У каждого события своя история. Давайте сохраним вашу"
            heading-id="about-cta-title"
          />

          <p v-reveal="80" class="mt-5 max-w-[34rem] leading-relaxed text-muted">
            Расскажите нам о своём событии, а мы поможем найти способ сделать его ещё особеннее.
          </p>

          <div v-reveal="160" class="mt-8">
            <BaseButton :to="primaryCta.to" size="lg">
              {{ primaryCta.label }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
