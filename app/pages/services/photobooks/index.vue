<script setup lang="ts">
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Printer, SwatchBook } from '@lucide/vue'
import { brand } from '~/config/brand'
import { heroClosedBook, heroOpenBook } from '~/config/photobook/hero'
import { graduationAlbumSample } from '~/config/photobook/showcase'

definePageMeta({
  service: 'photobooks',
  middleware: (to) => {
    if ('project' in to.query) {
      return navigateTo('/services/photobooks/personal', { replace: true })
    }
  },
})

const route = useRoute()
if (import.meta.client) {
  // Hash-only bookmarks are visible only in the browser. Hydrate the server's landing page first.
  watch(() => route.hash, (hash) => {
    if (hash !== '#studio') return
    onNuxtReady(() => {
      if (route.hash === '#studio') void navigateTo('/services/photobooks/personal', { replace: true })
    })
  }, { immediate: true })
}

const title = 'Фотокниги'
const description = 'Персональные фотокниги и выпускные альбомы, к которым хочется возвращаться.'
const canonical = `${useRequestURL().origin}/services/photobooks`

useSeoMeta({
  title,
  description,
  ogTitle: `${title} — ${brand.name}`,
  ogDescription: description,
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogUrl: canonical,
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })

const directions = [
  {
    title: 'Персональные фотокниги',
    description: 'Семейные истории, свадьбы, путешествия и самые дорогие воспоминания.',
    to: '/services/photobooks/personal',
    image: heroClosedBook.sand,
    tone: 'warm',
  },
  {
    title: 'Выпускные альбомы',
    description: 'Фотокниги для детских садов и школ, сохраняющие историю взросления.',
    to: '/services/photobooks/graduation',
    image: graduationAlbumSample,
    tone: 'sage',
  },
] as const

const details = [
  { icon: SwatchBook, title: 'Материалы обложки', text: 'Подберём фактуру и цвет под оформление книги.' },
  { icon: BookOpen, title: 'Переплёт', text: 'Подбор переплёта зависит от формата и количества страниц.' },
  { icon: Printer, title: 'Печать', text: 'При подготовке макета учтём качество исходных снимков.' },
]

const steps = ['Выбор фотокниги', 'Подготовка фотографий', 'Согласование макета', 'Изготовление']
</script>

<template>
  <div>
    <PhotobooksLocalNav />

    <PhotobooksHero
      :eyebrow="`Фотокниги ${brand.name}`"
      title="Моменты проходят."
      emphasis="Истории остаются."
      :description="description"
      :image="heroOpenBook"
    >
      <BaseButton to="#directions" size="lg">
        Выбрать фотокнигу
        <template #icon><ArrowDown class="size-4" /></template>
      </BaseButton>
    </PhotobooksHero>

    <section id="directions" class="bg-surface py-12 sm:py-16 lg:py-20" aria-labelledby="directions-title" tabindex="-1">
      <div class="container-page">
        <SectionHeading title="Какую историю сохраним?" heading-id="directions-title" />
        <div class="mt-7 grid gap-5 md:grid-cols-2 lg:mt-9 lg:gap-7">
          <article
            v-for="direction in directions"
            :key="direction.to"
            class="flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-bg"
          >
            <PhotobooksVisual :image="direction.image" :tone="direction.tone" ratio="16 / 9" sizes="480px md:560px" />
            <div class="flex flex-1 flex-col items-start gap-3 p-5 sm:p-7">
              <h3 class="font-display text-h3">{{ direction.title }}</h3>
              <p class="max-w-md text-muted">{{ direction.description }}</p>
              <BaseButton
                :to="direction.to"
                :aria-label="`Подробнее: ${direction.title}`"
                variant="secondary"
                class="mt-auto"
              >
                Подробнее
                <template #icon><ArrowUpRight class="size-4" /></template>
              </BaseButton>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="container-page py-12 sm:py-16" aria-labelledby="quality-title">
      <SectionHeading title="Детали фотокниги" heading-id="quality-title" />
      <ul class="mt-6 grid gap-5 md:grid-cols-3 lg:mt-8">
        <li v-for="detail in details" :key="detail.title" class="flex items-start gap-4 border-t border-border pt-5">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
            <component :is="detail.icon" class="size-5" :stroke-width="1.5" />
          </span>
          <div>
            <h3 class="font-display text-h3">{{ detail.title }}</h3>
            <p class="mt-1.5 text-sm text-muted">{{ detail.text }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section class="border-y border-border bg-surface py-12 sm:py-16" aria-labelledby="book-process-title">
      <div class="container-page">
        <SectionHeading title="От идеи до книги в руках" heading-id="book-process-title" />
        <ol class="mt-6 list-decimal gap-x-8 gap-y-4 pl-6 marker:font-semibold marker:text-accent sm:grid sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          <li v-for="step in steps" :key="step" class="py-2 pl-1 font-semibold">{{ step }}</li>
        </ol>
      </div>
    </section>

    <section class="container-page py-12 sm:py-16" aria-labelledby="book-cta-title">
      <div class="flex flex-wrap items-center justify-between gap-5 rounded-card bg-service-bg p-6 sm:p-9">
        <SectionHeading title="Сохраним вашу историю?" heading-id="book-cta-title" />
        <BaseButton to="#directions">
          Выбрать фотокнигу
          <template #icon><ArrowUp class="size-4" /></template>
        </BaseButton>
      </div>
    </section>
  </div>
</template>
