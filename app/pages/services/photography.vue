<script setup lang="ts">
import { brand } from '~/config/brand'

definePageMeta({ service: 'photography' })

// Bespoke page for the photography service — takes precedence over services/[slug].vue.
const title = 'Фотосъёмка в Новосибирске — портреты, Love Story, мероприятия'
const description =
  'Портретная съёмка, Love Story, семейные фотосессии и репортаж мероприятий. Пакеты, дополнительные услуги и онлайн-галерея готовых фотографий.'

const canonical = `${useRequestURL().origin}/services/photography`

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

// Choices live only while the visitor is on this page; they start from the position already in
// «Моя подборка», so sending the request again never asks to replace it with an empty one.
const { reset, syncFromSelection } = usePhotographyOrder()
const { ready } = useCart()
onMounted(() => watch(ready, (value) => value && syncFromSelection(), { immediate: true }))
onBeforeUnmount(reset)
</script>

<template>
  <div>
    <PhotographyHero />
    <PhotographyFormats />
    <PhotographyProcess />
    <PhotographyPricing />
    <PhotographyExtras />
    <PhotographerIntroduction />
    <PhotographyFaq />
    <PhotographyCta />
    <PhotographyStickyCta />
  </div>
</template>
