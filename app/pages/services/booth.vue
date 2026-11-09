<script setup lang="ts">
import { brand } from '~/config/brand'

// Bespoke page for the booth service — takes precedence over services/[slug].vue.
const title = 'Аренда AI-фотобудки на мероприятие'
const description =
  'Аренда AI-фотобудки для свадеб, корпоративов и праздников. Фотографии гостей превращаются в уникальные AI-образы прямо на мероприятии.'

const canonical = `${useRequestURL().origin}/services/booth`

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

// The selected event type lives only while the visitor is on this page.
const selectedEvent = useBoothEvent()
onBeforeUnmount(() => {
  selectedEvent.value = null
})
</script>

<template>
  <div>
    <BoothHero />
    <BoothTransformation />
    <BoothEventTypes />
    <BoothHowItWorks />
    <BoothGallery />
    <BoothBusiness />
    <BoothEquipment />
    <BoothCustomization />
    <BoothFaq />
    <BoothBooking />
  </div>
</template>
