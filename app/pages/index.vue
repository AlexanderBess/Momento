<script setup lang="ts">
import HomeHeroSection from '~/components/home/HeroSection.vue'
import { brand } from '~/config/brand'

useSeoMeta({
  description: brand.description,
  ogTitle: `${brand.name} — ${brand.tagline}`,
  ogDescription: brand.description,
  ogType: 'website',
  ogLocale: 'ru_RU',
})
</script>

<template>
  <div>
    <HomeHeroSection />
    <ServicesSection />
    <AIPhotoBoothSection />
    <BenefitsSection />
    <FinalCTASection />
  </div>
</template>
