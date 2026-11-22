<script setup lang="ts">
import { brand } from '~/config/brand'

useSeoMeta({
  title: 'О нас',
  description:
    'MOMENTO — семейная креативная студия по фотосъёмке, фотозонам, AI-фотобудке и фотокнигам. О нас, нашей философии и подходе к созданию воспоминаний.',
  ogTitle: `О нас — ${brand.name}`,
  ogDescription:
    'MOMENTO — семейная креативная студия по фотосъёмке, фотозонам, AI-фотобудке и фотокнигам.',
  ogType: 'website',
  ogLocale: 'ru_RU',
})
</script>

<template>
  <div>
    <HeroSection />
    <OurStorySection />
    <OurApproachSection />
    <FinalCtaSection />
  </div>
</template>
