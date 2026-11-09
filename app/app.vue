<script setup lang="ts">
import { brand } from '~/config/brand'

useHead({
  titleTemplate: (title) => (title ? `${title} — ${brand.name}` : `${brand.name} — ${brand.tagline}`),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
