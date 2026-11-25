<script setup lang="ts">
import { heroOpenBook } from '~/config/photobook/hero'
import { guideCoverSample } from '~/config/photobook/showcase'
import { photobookGuideItem } from '~/lib/selection'
import { PHOTOBOOK_QUOTE_LABEL } from '#shared/photobookCollection'
import { defaultGuideOptions, type PhotobookGuideOptions } from '#shared/photobookGuide'

const { addToSelection } = useSelection()
const options = ref(defaultGuideOptions())
const previewOpen = ref(false)
const item = computed(() => photobookGuideItem(options.value))
const preview = computed(() => previewOpen.value ? heroOpenBook : guideCoverSample(options.value))

function update(next: PhotobookGuideOptions) {
  previewOpen.value = next.format !== options.value.format || next.pageCount !== options.value.pageCount
  options.value = next
}
</script>

<template>
  <section id="book-guide" class="container-page py-12 sm:py-16" aria-labelledby="book-guide-title" tabindex="-1">
    <SectionHeading
      title="Почувствуйте разницу"
      heading-id="book-guide-title"
      lead="Подберите размер, количество страниц, материал и цвет обложки для своей фотокниги."
    />

    <div class="mt-6 grid items-start gap-5 rounded-card border border-border bg-surface p-4 sm:mt-8 sm:p-6 md:grid-cols-2 lg:gap-9">
      <PhotobooksVisual
        :key="preview.src ?? preview.alt" :image="preview" ratio="4 / 3"
        sizes="480px md:550px" tone="warm" class="rounded-card"
      />
      <div class="grid min-w-0 gap-4">
        <PhotobookGuideControls :model-value="options" @update:model-value="update" />

        <div class="grid gap-3 border-t border-border pt-4">
          <p class="text-sm font-semibold">Ваши параметры</p>
          <ul aria-label="Выбранные параметры" class="flex flex-wrap gap-1.5">
            <li v-for="detail in item.details" :key="detail" class="rounded-full bg-surface-muted px-2.5 py-1 text-xs">
              {{ detail }}
            </li>
          </ul>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold text-muted">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
            <BaseButton @click="addToSelection(item)">Добавить в заявку</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
