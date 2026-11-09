<script setup lang="ts">
import { ArrowRight, Check } from '@lucide/vue'
import { boothBusinessImage, boothBusinessPoints } from '~/config/booth'
import { buildOrderLink } from '~/config/order'

const corporateLink = buildOrderLink({ service: 'booth', event: 'corporate' })

const media = useTemplateRef<HTMLDivElement>('media')
useParallax(media, 28)
</script>

<template>
  <section id="business" class="section-y clip-x" aria-labelledby="business-title">
    <div class="container-page">
      <div class="grid items-center gap-10 overflow-hidden rounded-[1.75rem] bg-text text-bg lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-0">
        <!-- Image with a light parallax (oversized by 2×strength so edges never show). -->
        <div class="relative h-72 overflow-hidden sm:h-96 lg:h-full lg:min-h-[36rem]">
          <ClipReveal class="absolute inset-0">
            <div ref="media" class="parallax-media absolute inset-x-0 -inset-y-8">
              <PhotoFrame :image="boothBusinessImage" ratio="fill" :rounded="false" sizes="(min-width: 1024px) 640px, 100vw" />
            </div>
          </ClipReveal>
        </div>

        <div class="flex flex-col items-start gap-6 px-5 pb-10 sm:px-10 lg:px-14 lg:py-16">
          <p v-reveal class="eyebrow text-bg/70">Для бизнеса</p>
          <h2 id="business-title" v-reveal="60" class="font-display text-h2">Больше, чем развлечение для гостей</h2>
          <p v-reveal="120" class="max-w-md text-lead text-bg/75">
            Фотобудка становится частью мероприятия компании: работает на атмосферу, бренд и вовлечение участников.
          </p>

          <ul class="mt-2 flex flex-col gap-4">
            <li v-for="(point, index) in boothBusinessPoints" :key="point.title" v-reveal="160 + index * 70" class="flex gap-3">
              <span class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true">
                <Check class="size-3.5" :stroke-width="2.5" />
              </span>
              <div>
                <h3 class="font-semibold">{{ point.title }}</h3>
                <p class="mt-0.5 text-[0.9375rem] leading-relaxed text-bg/70">{{ point.text }}</p>
              </div>
            </li>
          </ul>

          <BaseButton :to="corporateLink" size="lg" class="mt-4">
            Обсудить корпоративное мероприятие
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.parallax-media {
  transform: translate3d(0, var(--parallax-y, 0px), 0);
}
</style>
