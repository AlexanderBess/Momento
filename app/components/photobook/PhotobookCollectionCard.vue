<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { photobookCollectionImages } from '~/config/photobook/showcase'
import { photobookCollectionItem } from '~/lib/selection'
import type { PhotobookPreset } from '~/types/photobook'
import { PHOTOBOOK_QUOTE_LABEL } from '#shared/photobookCollection'

const props = defineProps<{ preset: PhotobookPreset }>()
const { addToSelection } = useSelection()

const item = computed(() => photobookCollectionItem({ presetId: props.preset.id }))
const image = computed(() => photobookCollectionImages[props.preset.id] ?? {
  src: null,
  alt: `Обложка и разворот фотокниги ${props.preset.name}`,
  width: 1600,
  height: 1200,
})
</script>

<template>
  <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-bg">
    <PhotobooksVisual :image="image" tone="warm" ratio="2 / 1" sizes="480px md:560px" />
    <div class="flex flex-1 flex-col items-start gap-3 p-5 sm:p-6">
      <h3 class="font-display text-h3">{{ preset.name }}</h3>
      <p class="text-sm leading-relaxed text-muted">{{ preset.description }}</p>
      <ul class="flex flex-wrap gap-1.5" aria-label="Параметры фотокниги">
        <li v-for="detail in item.details" :key="detail" class="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium">
          {{ detail }}
        </li>
      </ul>
      <div class="mt-auto flex w-full flex-wrap items-center justify-between gap-3 pt-2">
        <p class="text-sm font-semibold text-muted">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
        <BaseButton :aria-label="`Добавить в заявку: ${preset.name}`" @click="addToSelection(item)">
          Добавить в заявку
          <template #icon><Plus class="size-4" /></template>
        </BaseButton>
      </div>
    </div>
  </article>
</template>
