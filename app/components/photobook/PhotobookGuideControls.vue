<script setup lang="ts">
import { findCoverType } from '~/config/photobook/covers'
import { findFormat, pageCountsFor, photobookFormats } from '~/config/photobook/formats'
import { guideCoversFor, normalizeGuideOptions, type PhotobookGuideOptions } from '#shared/photobookGuide'

const options = defineModel<PhotobookGuideOptions>({ required: true })
const uid = useId()

const format = computed(() => findFormat(options.value.format))
const pages = computed(() => pageCountsFor(options.value.format))
const covers = computed(() => guideCoversFor(options.value.format))
const cover = computed(() => findCoverType(options.value.coverType))
const color = computed(() => cover.value.colors.find(({ id }) => id === options.value.coverColor))

function patch(value: Partial<PhotobookGuideOptions>) {
  options.value = normalizeGuideOptions({ ...options.value, ...value })
}
</script>

<template>
  <div class="grid min-w-0 gap-4">
    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold">Размер</legend>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <label v-for="size in photobookFormats" :key="size.id" class="chip" :class="options.format === size.id && 'is-selected'">
          <input
            class="sr-only" type="radio" :name="`${uid}-format`" :value="size.id" :checked="options.format === size.id"
            @change="patch({ format: size.id })"
          >
          {{ size.widthCm }} × {{ size.heightCm }} см
        </label>
      </div>
      <p class="mt-1.5 text-xs text-muted">{{ format.label }} формат, размер закрытой страницы.</p>
    </fieldset>

    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold">Количество страниц</legend>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <label v-for="count in pages" :key="count" class="chip" :class="options.pageCount === count && 'is-selected'">
          <input
            class="sr-only" type="radio" :name="`${uid}-pages`" :value="count" :checked="options.pageCount === count"
            @change="patch({ pageCount: count })"
          >
          {{ count }}
        </label>
      </div>
      <p class="mt-1.5 text-xs text-muted">Внутренние страницы. В одном развороте две страницы.</p>
    </fieldset>

    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold">Материал обложки</legend>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <label v-for="material in covers" :key="material.id" class="chip" :class="options.coverType === material.id && 'is-selected'">
          <input
            class="sr-only" type="radio" :name="`${uid}-cover`" :value="material.id" :checked="options.coverType === material.id"
            @change="patch({ coverType: material.id })"
          >
          {{ material.label }}
        </label>
      </div>
      <p class="mt-1.5 text-xs text-muted">{{ cover.description }}</p>
    </fieldset>

    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold">{{ cover.usesPhoto ? 'Цвет корешка и полосы с названием' : 'Цвет обложки' }}</legend>
      <div class="mt-1 flex flex-wrap gap-1">
        <label v-for="swatch in cover.colors" :key="swatch.id" class="swatch" :class="options.coverColor === swatch.id && 'is-selected'" :title="swatch.label">
          <input
            class="sr-only" type="radio" :name="`${uid}-color`" :value="swatch.id"
            :aria-label="swatch.label" :checked="options.coverColor === swatch.id" @change="patch({ coverColor: swatch.id })"
          >
          <span class="swatch-dot" :style="{ backgroundColor: swatch.hex }" aria-hidden="true" />
        </label>
      </div>
      <p class="text-xs text-muted">{{ color?.label }}</p>
    </fieldset>
  </div>
</template>
