<script setup lang="ts">
import { describeOrder, parseOrderQuery } from '~/config/order'

// The order form is not built yet. The stub already reads the shared prefill contract
// (/order?service=…&event=…&package=…, see config/order.ts) so links from service pages are not lost.
const route = useRoute()
const prefill = computed(() => parseOrderQuery(route.query))
const summary = computed(() => {
  const parts = describeOrder(prefill.value)
  return parts.length ? `Вы выбрали: ${parts.join(' · ')}.` : ''
})
</script>

<template>
  <PageStub
    title="Заявка"
    :description="['Онлайн-заявка появится в ближайшее время.', summary].filter(Boolean).join(' ')"
  />
</template>
