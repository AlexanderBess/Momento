<script setup lang="ts">
import { brand } from '~/config/brand'

// Bespoke page for the photo zones service — takes precedence over services/[slug].vue.
const title = 'Фотозоны в аренду — свадьбы, дни рождения, события'
const description =
  'Аренда и создание фотозон: готовые концепции и индивидуальное оформление с доставкой, монтажом и демонтажом под ключ.'

const canonical = `${useRequestURL().origin}/services/photozones`

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

// The page-level choice lives only while the visitor is here; the cart itself persists.
const { reset } = usePhotozoneOrder()
onBeforeUnmount(reset)
</script>

<template>
  <div class="theme-photozones">
    <!-- theme-photozones re-points the accent tokens to sage / olive for this page only (tokens.css). -->
    <PhotozonesHero />
    <PhotozonesFormats />
    <PhotozonesCatalog />
    <PhotozonesCustom />
    <PhotozonesService />
    <PhotozonesProcess />
    <PhotozonesFinalCta />
    <PhotozoneDetailsDialog />
  </div>
</template>
