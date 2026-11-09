<script setup lang="ts">
import { eventTypeLabels, parseOrderQuery } from '~/config/order'
import { findService } from '~/config/services'

// The order form is not built yet. The stub already reads the shared prefill contract
// (/order?service=…&event=…, see config/order.ts) so links from service pages are not lost.
const route = useRoute()
const prefill = computed(() => parseOrderQuery(route.query))
const summary = computed(() => {
  const { service, event } = prefill.value
  const parts = [service && findService(service)?.title, event && eventTypeLabels[event]].filter(Boolean)
  return parts.length ? `Вы выбрали: ${parts.join(' · ')}.` : ''
})
</script>

<template>
  <PageStub
    title="Заявка"
    :description="['Онлайн-заявка появится в ближайшее время.', summary].filter(Boolean).join(' ')"
  />
</template>
