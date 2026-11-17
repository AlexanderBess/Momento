<script setup lang="ts">
import { brand } from '~/config/brand'

// Bespoke page for the photobook service — takes precedence over services/[slug].vue.
const title = 'Фотокниги — онлайн-конструктор'
const description =
  'Соберите фотокнигу в онлайн-конструкторе MOMENTO: формат, обложка, бумага и вёрстка разворотов с живым предпросмотром.'

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
</script>

<template>
  <div>
    <PhotobookHero />
    <PhotobookCollections />
    <PhotobookConfigurator />
    <PhotobookMaterials />
    <PhotobookProcess />
    <PhotobookFinalCta />
  </div>
</template>
