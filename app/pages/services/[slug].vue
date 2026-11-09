<script setup lang="ts">
import { findService } from '~/config/services'

// One route for all services, driven by config/services.ts.
// Unknown slugs → 404. A service that needs a bespoke layout later can get its own page file
// (e.g. pages/services/booth.vue), which takes precedence over this dynamic route.
definePageMeta({
  validate: (route) => Boolean(findService(String(route.params.slug))),
})

const route = useRoute()
const service = computed(() => findService(String(route.params.slug))!)
</script>

<template>
  <PageStub :title="service.title" :description="service.summary" eyebrow="Услуга · страница в разработке">
    <template #actions>
      <BaseButton to="/services" variant="ghost">Все услуги</BaseButton>
    </template>
  </PageStub>
</template>
