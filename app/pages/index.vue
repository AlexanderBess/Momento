<script setup lang="ts">
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
    <HeroSection />
    <ServicesSection />
    <AIPhotoBoothSection />
    <PortfolioSection />
    <BenefitsSection />
    <FinalCTASection />
  </div>
</template>
