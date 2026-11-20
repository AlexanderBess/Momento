<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import { COVER_TITLE_MAX_LENGTH, coverTypes, findCoverType } from '~/config/photobook/covers'
import { findFormat, pageCountsFor, photobookFormats } from '~/config/photobook/formats'
import { paperTypes } from '~/config/photobook/materials'
import { photobookPricing } from '~/config/photobook/pricing'
import { normalize } from '~/lib/photobook'
import type { ProjectState } from '~/lib/photobookProjects'
import type { PhotobookConfig } from '~/types/photobook'

/**
 * Simplified photobook editor for the selection: only the main order parameters. Spreads, photos
 * and the 3D preview stay in Book Studio. Edits the project's own PhotobookConfig (the single
 * model of a book), normalised after every change.
 */
const model = defineModel<ProjectState>({ required: true })
const uid = useId()

const c = computed(() => model.value.config)
const cover = computed(() => findCoverType(c.value.coverType))
const allowedCovers = computed(() => {
  const ids = findFormat(c.value.format).coverTypes
  return ids ? coverTypes.filter((t) => ids.includes(t.id)) : coverTypes
})

function patch(change: Partial<PhotobookConfig>) {
  model.value = { ...model.value, config: normalize({ ...model.value.config, ...change }) }
}

const setQuantity = (n: number) => patch({ quantity: Math.min(photobookPricing.maxQuantity, Math.max(1, n)) })
</script>

<template>
  <div class="grid gap-7">
    <fieldset>
      <legend class="text-sm font-semibold">Формат</legend>
      <div class="mt-3 flex flex-wrap gap-2">
        <label v-for="f in photobookFormats" :key="f.id" class="chip" :class="c.format === f.id && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-format`" :checked="c.format === f.id" @change="patch({ format: f.id })">
          {{ f.label }} {{ f.widthCm }}×{{ f.heightCm }}
        </label>
      </div>
    </fieldset>

    <div>
      <label :for="`${uid}-pages`" class="text-sm font-semibold">Количество страниц</label>
      <select :id="`${uid}-pages`" class="field-input mt-2" :value="c.pageCount" @change="patch({ pageCount: Number(($event.target as HTMLSelectElement).value) })">
        <option v-for="n in pageCountsFor(c.format)" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>

    <fieldset>
      <legend class="text-sm font-semibold">Обложка</legend>
      <div class="mt-3 flex flex-wrap gap-2">
        <label v-for="t in allowedCovers" :key="t.id" class="chip" :class="c.coverType === t.id && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-cover`" :checked="c.coverType === t.id" @change="patch({ coverType: t.id })">
          {{ t.label }}
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend class="text-sm font-semibold">{{ cover.usesPhoto ? 'Цвет корешка' : 'Цвет обложки' }}</legend>
      <div class="mt-2 flex flex-wrap gap-1">
        <label v-for="color in cover.colors" :key="color.id" class="swatch" :class="c.coverColor === color.id && 'is-selected'" :title="color.label">
          <input type="radio" class="sr-only" :name="`${uid}-color`" :aria-label="color.label" :checked="c.coverColor === color.id" @change="patch({ coverColor: color.id })">
          <span class="swatch-dot" :style="{ backgroundColor: color.hex }" />
        </label>
      </div>
    </fieldset>

    <div class="grid gap-2">
      <label class="flex items-center justify-between gap-4 text-sm font-semibold">
        Название на обложке
        <span class="switch">
          <input type="checkbox" role="switch" class="sr-only" :checked="c.coverTitleEnabled" @change="patch({ coverTitleEnabled: ($event.target as HTMLInputElement).checked })">
        </span>
      </label>
      <input
        v-if="c.coverTitleEnabled"
        class="field-input"
        type="text"
        :maxlength="COVER_TITLE_MAX_LENGTH"
        aria-label="Текст названия"
        :value="c.coverTitle"
        @input="patch({ coverTitle: ($event.target as HTMLInputElement).value })"
      >
    </div>

    <fieldset>
      <legend class="text-sm font-semibold">Бумага</legend>
      <div class="mt-3 flex flex-wrap gap-2">
        <label v-for="p in paperTypes" :key="p.id" class="chip" :class="c.paperType === p.id && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-paper`" :checked="c.paperType === p.id" @change="patch({ paperType: p.id })">
          {{ p.label }}
        </label>
      </div>
    </fieldset>

    <div class="flex items-center justify-between gap-4">
      <span :id="`${uid}-qty`" class="text-sm font-semibold">Экземпляров</span>
      <div class="flex items-center gap-2" role="group" :aria-labelledby="`${uid}-qty`">
        <button type="button" class="stepper-button size-10!" :disabled="c.quantity <= 1" aria-label="Меньше экземпляров" @click="setQuantity(c.quantity - 1)">
          <Minus class="size-4" :stroke-width="2" aria-hidden="true" />
        </button>
        <span class="w-8 text-center font-semibold tabular-nums" aria-live="polite">{{ c.quantity }}</span>
        <button
          type="button"
          class="stepper-button size-10!"
          :disabled="c.quantity >= photobookPricing.maxQuantity"
          aria-label="Больше экземпляров"
          @click="setQuantity(c.quantity + 1)"
        >
          <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </div>

    <label class="flex cursor-pointer items-start gap-3 rounded-card bg-surface p-4 text-sm ring-1 ring-border">
      <input
        type="checkbox"
        class="mt-0.5 size-5 shrink-0 accent-(--color-accent)"
        :checked="model.layoutComplete"
        @change="model = { ...model, layoutComplete: ($event.target as HTMLInputElement).checked }"
      >
      <span>
        <span class="font-semibold">Макет готов к согласованию</span>
        <span class="mt-0.5 block text-xs text-muted">Без отметки книга уйдёт в заявке со статусом «Макет не завершён» — это нормально.</span>
      </span>
    </label>
  </div>
</template>
