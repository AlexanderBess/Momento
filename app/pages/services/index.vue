<script setup lang="ts">
import { services } from '~/config/services'

useSeoMeta({ title: 'Услуги', robots: 'noindex, follow' })
</script>

<template>
  <section class="container-page section-y">
    <SectionHeading
      as="h1"
      eyebrow="Услуги"
      title="Всё для ярких моментов"
      lead="Подробные страницы услуг скоро появятся."
    />
    <ul class="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="(service, index) in services" :key="service.slug" v-reveal="index * 90">
        <ServiceCard :service="service" heading-level="h2" />
      </li>
    </ul>
  </section>
</template>
