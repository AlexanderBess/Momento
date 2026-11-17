<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { COVER_TITLE_MAX_LENGTH, coverTypes, titlePositions } from '~/config/photobook/covers'
import { findFormat } from '~/config/photobook/formats'
import { findImage } from '~/config/photobook/library'
import type { CoverTypeId, PhotobookConfig } from '~/types/photobook'

const { config, cover, update, coverPose, pickerTarget } = usePhotobookStudio()

const allowedTypes = computed(() => {
  const allowed = findFormat(config.value.format).coverTypes
  return coverTypes.filter((type) => !allowed || allowed.includes(type.id))
})

const coverImage = computed(() => findImage(config.value.coverImageId))
const uid = useId()

/** Every cover change shows the front of the closed book. */
function set(patch: Partial<PhotobookConfig>) {
  coverPose.value = 'three-quarter'
  update({ ...patch, activeView: 'cover' })
}

function setType(id: CoverTypeId) {
  set({ coverType: id })
}

function onTitle(event: Event) {
  set({ coverTitle: (event.target as HTMLInputElement).value.slice(0, COVER_TITLE_MAX_LENGTH) })
}
</script>

<template>
  <!-- Material -->
  <fieldset>
    <legend class="mb-3 text-sm font-semibold">Тип обложки</legend>
    <div class="grid grid-cols-3 gap-2">
      <label
        v-for="type in allowedTypes"
        :key="type.id"
        class="option-card flex cursor-pointer flex-col overflow-hidden"
        :class="config.coverType === type.id && 'is-selected'"
      >
        <input
          type="radio"
          name="pb-cover-type"
          class="sr-only"
          :value="type.id"
          :checked="config.coverType === type.id"
          :aria-describedby="`${uid}-${type.id}`"
          @change="setType(type.id)"
        >
        <span class="relative block aspect-[5/3] overflow-hidden rounded-t-[0.9375rem]" aria-hidden="true">
          <PhotobookImage v-if="type.usesPhoto" :image-id="config.coverImageId" sizes="120px" />
          <MaterialSurface v-else :surface="type.surface" :color="type.colors[Math.min(1, type.colors.length - 1)]!.hex" lit />
        </span>
        <span class="px-2.5 py-2.5 text-[0.8125rem] leading-tight font-semibold">{{ type.label }}</span>
        <span :id="`${uid}-${type.id}`" class="sr-only">{{ type.description }}</span>
      </label>
    </div>
    <p class="mt-2.5 text-xs text-muted">{{ cover.description }}</p>
  </fieldset>

  <!-- Photo for a printed cover -->
  <div v-if="cover.usesPhoto" class="flex items-center gap-4 rounded-card border border-border bg-surface p-3">
    <span class="relative size-16 shrink-0 overflow-hidden rounded-[0.625rem]">
      <PhotobookImage :image-id="config.coverImageId" sizes="64px" />
    </span>
    <span class="flex min-w-0 flex-1 flex-col">
      <span class="text-sm font-semibold">Фото на обложке</span>
      <span class="truncate text-xs text-muted">{{ coverImage?.title }}</span>
    </span>
    <button
      type="button"
      class="inline-flex min-h-11 items-center gap-1.5 rounded-button px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
      @click="pickerTarget = { kind: 'cover' }"
    >
      <RefreshCw class="size-4" :stroke-width="2" aria-hidden="true" />
      Заменить
    </button>
  </div>

  <!-- Colour -->
  <fieldset>
    <legend class="mb-2 flex w-full items-baseline justify-between gap-3 text-sm font-semibold">
      {{ cover.usesPhoto ? 'Цвет корешка' : 'Цвет обложки' }}
      <span class="text-xs font-normal text-muted">{{ cover.colors.find((c) => c.id === config.coverColor)?.label }}</span>
    </legend>
    <div class="-ml-1 flex flex-wrap gap-0.5">
      <label
        v-for="color in cover.colors"
        :key="color.id"
        class="swatch"
        :class="config.coverColor === color.id && 'is-selected'"
        :title="color.label"
      >
        <input
          type="radio"
          name="pb-cover-color"
          class="sr-only"
          :value="color.id"
          :checked="config.coverColor === color.id"
          :aria-label="color.label"
          @change="set({ coverColor: color.id })"
        >
        <span class="swatch-dot">
          <MaterialSurface :surface="cover.surface === 'print' ? 'matte' : cover.surface" :color="color.hex" />
        </span>
      </label>
    </div>
  </fieldset>

  <!-- Title -->
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4">
      <label :for="`${uid}-title`" class="text-sm font-semibold">Название на обложке</label>
      <label class="switch" title="Показывать название">
        <input
          type="checkbox"
          role="switch"
          class="sr-only"
          :checked="config.coverTitleEnabled"
          aria-label="Показывать название на обложке"
          @change="set({ coverTitleEnabled: ($event.target as HTMLInputElement).checked })"
        >
      </label>
    </div>

    <div v-if="config.coverTitleEnabled" class="flex flex-col gap-5">
      <div>
        <input
          :id="`${uid}-title`"
          class="field-input"
          type="text"
          :value="config.coverTitle"
          :maxlength="COVER_TITLE_MAX_LENGTH"
          placeholder="Например, «Наше лето»"
          autocomplete="off"
          @input="onTitle"
        >
        <p class="mt-1.5 text-right text-xs text-muted tabular-nums">{{ config.coverTitle.length }} / {{ COVER_TITLE_MAX_LENGTH }}</p>
      </div>

      <fieldset>
        <legend class="mb-2.5 text-sm font-semibold">{{ cover.usesPhoto ? 'Цвет надписи' : 'Отделка надписи' }}</legend>
        <div class="flex flex-wrap gap-1.5">
          <label
            v-for="color in cover.titleColors"
            :key="color.id"
            class="chip"
            :class="config.coverTitleColor === color.id && 'is-selected'"
          >
            <input
              type="radio"
              name="pb-title-color"
              class="sr-only"
              :value="color.id"
              :checked="config.coverTitleColor === color.id"
              @change="set({ coverTitleColor: color.id })"
            >
            <span
              class="size-3 rounded-full ring-1 ring-black/15"
              :style="{
                background:
                  color.finish === 'foil'
                    ? `linear-gradient(135deg, ${color.hex}, ${color.hexTo})`
                    : color.finish === 'deboss'
                      ? 'transparent'
                      : color.hex,
              }"
              aria-hidden="true"
            />
            {{ color.label }}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend class="mb-2.5 text-sm font-semibold">Расположение</legend>
        <div class="grid grid-cols-3 gap-1 rounded-button bg-surface-muted p-1">
          <label
            v-for="position in titlePositions"
            :key="position.id"
            class="segment"
            :class="config.coverTitlePosition === position.id && 'is-selected'"
          >
            <input
              type="radio"
              name="pb-title-position"
              class="sr-only"
              :value="position.id"
              :checked="config.coverTitlePosition === position.id"
              @change="set({ coverTitlePosition: position.id })"
            >
            {{ position.label }}
          </label>
        </div>
      </fieldset>
    </div>
  </div>
</template>
