<script setup lang="ts">
import { ArrowDown, ArrowLeft, ArrowUp } from '@lucide/vue'
import { brand } from '~/config/brand'
import { heroClosedBook } from '~/config/photobook/hero'
import { photobookPresets } from '~/config/photobook/presets'
import { PHOTOBOOK_QUOTE_LABEL } from '#shared/photobookCollection'

definePageMeta({ service: 'photobooks' })

const route = useRoute()
onNuxtReady(() => {
  // Browsers can carry the old fragment across the server redirect.
  if (route.hash === '#studio') {
    void navigateTo({ path: route.path, query: route.query }, { replace: true })
  }
})

const title = 'Персональные фотокниги'
const description = 'Фотокниги из ваших фотографий — для семейных историй, свадеб и путешествий. Оформление и изготовление берёт на себя MOMENTO.'
const canonical = `${useRequestURL().origin}/services/photobooks/personal`

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

const steps = [
  'Вы выбираете фотокнигу.',
  'Передаёте любимые фотографии.',
  'Мы подготавливаем и согласуем с вами макет.',
  'Вы получаете готовую книгу.',
]

const faq = [
  { question: 'Можно ли использовать свои фотографии?', answer: 'Да. Для фотокниги подойдут ваши снимки. При согласовании заявки обсудим, как их передать.' },
  { question: 'Нужно ли самостоятельно оформлять страницы?', answer: 'Макет подготовит MOMENTO. Вы сможете обсудить пожелания к оформлению и согласовать готовый макет.' },
  { question: 'Можно ли изменить параметры готовой коллекции?', answer: 'Укажите пожелания в комментарии к заявке. Возможные изменения обсудим при согласовании.' },
  { question: 'Как согласовывается макет?', answer: 'Мы подготовим макет на основе ваших снимков и обсудим его с вами перед изготовлением.' },
  { question: 'Как определяется стоимость фотокниги?', answer: 'Мы рассчитываем стоимость индивидуально после согласования параметров книги и ваших пожеланий.' },
]
</script>

<template>
  <div>
    <PhotobooksLocalNav />
    <PhotobooksHero
      :eyebrow="title"
      title="Истории, которые"
      emphasis="хочется перелистывать."
      description="Создадим фотокнигу из ваших любимых фотографий. Поможем подобрать материалы, подготовим макет и согласуем его с вами перед изготовлением."
      :image="heroClosedBook.sand"
      tone="warm"
    >
      <p class="text-sm font-semibold text-muted">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
      <div class="flex flex-wrap gap-2.5">
        <BaseButton to="#collections">
          Выбрать коллекцию
          <template #icon><ArrowDown class="size-4" /></template>
        </BaseButton>
        <BaseButton to="/services/photobooks#directions" variant="secondary">
          <ArrowLeft class="size-4" aria-hidden="true" />
          Все фотокниги
        </BaseButton>
      </div>
    </PhotobooksHero>

    <section id="collections" class="bg-surface py-12 sm:py-16" aria-labelledby="collections-title" tabindex="-1">
      <div class="container-page">
        <SectionHeading title="Готовые коллекции" heading-id="collections-title" />
        <ul class="mt-7 grid gap-5 md:grid-cols-2 lg:mt-9 lg:gap-7">
          <li v-for="preset in photobookPresets" :key="preset.id">
            <PhotobookCollectionCard :preset="preset" />
          </li>
        </ul>
      </div>
    </section>

    <PhotobookBookGuide />

    <section class="container-page py-12 sm:py-16" aria-labelledby="personal-process-title">
      <SectionHeading title="Мы позаботимся об остальном" heading-id="personal-process-title" />
      <ol class="mt-6 list-decimal gap-x-8 gap-y-3 pl-6 marker:font-semibold marker:text-accent sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="step in steps" :key="step" class="py-2 pl-1">{{ step }}</li>
      </ol>
    </section>

    <section class="border-y border-border bg-surface py-12 sm:py-16" aria-labelledby="personal-faq-title">
      <div class="container-page grid gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-10">
        <SectionHeading title="Вопросы о фотокнигах" heading-id="personal-faq-title" />
        <FaqAccordion :items="faq" />
      </div>
    </section>

    <section class="container-page py-12 sm:py-16" aria-labelledby="personal-cta-title">
      <div class="flex flex-wrap items-center justify-between gap-5 rounded-card bg-[#ece2d5] p-6 sm:p-9">
        <SectionHeading title="Ваша история начинается с первой страницы." heading-id="personal-cta-title" />
        <BaseButton to="#book-guide">
          Подобрать параметры
          <template #icon><ArrowUp class="size-4" /></template>
        </BaseButton>
      </div>
    </section>
  </div>
</template>
