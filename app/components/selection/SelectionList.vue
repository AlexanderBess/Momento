<script setup lang="ts">
/** Positions of «Моя подборка» with edit / remove — shared by the drawer and /checkout. */
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { items } = useCart()
const { edit, removeItem, notice } = useSelection()

// Highlight the position that was just saved in the editor for a moment.
const highlighted = ref<string | null>(null)
const visibleNotice = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
watch(notice, (value) => {
  highlighted.value = value?.itemId ?? null
  visibleNotice.value = value?.text ?? null
  clearTimeout(timer)
  timer = setTimeout(() => {
    highlighted.value = null
    visibleNotice.value = null
  }, 6000)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div>
    <ul class="grid gap-3" aria-label="Позиции подборки">
      <li v-for="item in items" :key="item.id">
        <SelectionItem
          :item="item"
          :compact="compact"
          :highlight="highlighted === item.id"
          @edit="edit(item.id)"
          @remove="removeItem(item.id)"
        />
      </li>
    </ul>
    <p class="sr-only" role="status" aria-live="polite">{{ notice?.text }}</p>
    <p v-if="visibleNotice" class="mt-3 text-sm text-muted" aria-hidden="true">
      {{ visibleNotice }}
    </p>
  </div>
</template>
