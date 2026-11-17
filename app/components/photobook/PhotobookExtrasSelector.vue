<script setup lang="ts">
import { endpaperColors, extraOptions } from '~/config/photobook/materials'
import { ENDPAPER_ID } from '~/lib/photobook'
import type { ExtraId } from '~/types/photobook'

/** Endpaper, two-tone spine, embossed frame, spine lettering — each change shows where it is visible. */
const { config, cover, update, focusView, coverPose } = usePhotobookStudio()

function setEndpaper(id: string) {
  update({ endpaperColor: id })
  focusView('spread', ENDPAPER_ID)
}

function setSpine(id: string) {
  update({ spineColor: id, activeView: 'cover' })
  coverPose.value = 'spine'
}

function toggleExtra(id: ExtraId, value: boolean) {
  update({ extras: { ...config.value.extras, [id]: value }, activeView: 'cover' })
  coverPose.value = id === 'spineText' ? 'spine' : 'three-quarter'
}

function unavailableReason(id: ExtraId): string | null {
  if (id === 'embossing' && !cover.value.supportsEmbossing) return 'Недоступно для обложки с фотопечатью'
  if (id === 'spineText' && (!config.value.coverTitleEnabled || !config.value.coverTitle.trim())) {
    return 'Сначала добавьте название книги'
  }
  return null
}
</script>

<template>
  <fieldset>
    <legend class="mb-2 flex w-full items-baseline justify-between gap-3 text-sm font-semibold">
      Цвет форзаца
      <span class="text-xs font-normal text-muted">{{ endpaperColors.find((c) => c.id === config.endpaperColor)?.label }}</span>
    </legend>
    <div class="-ml-1 flex flex-wrap gap-0.5">
      <label
        v-for="color in endpaperColors"
        :key="color.id"
        class="swatch"
        :class="config.endpaperColor === color.id && 'is-selected'"
        :title="color.label"
      >
        <input
          type="radio"
          name="pb-endpaper"
          class="sr-only"
          :value="color.id"
          :checked="config.endpaperColor === color.id"
          :aria-label="color.label"
          @change="setEndpaper(color.id)"
        >
        <span class="swatch-dot"><MaterialSurface surface="texture" :color="color.hex" /></span>
      </label>
    </div>
  </fieldset>

  <fieldset v-if="cover.supportsSpineColor">
    <legend class="mb-2 text-sm font-semibold">Цвет корешка</legend>
    <div class="flex flex-wrap gap-1.5">
      <label class="chip" :class="config.spineColor === 'match' && 'is-selected'">
        <input
          type="radio"
          name="pb-spine"
          class="sr-only"
          value="match"
          :checked="config.spineColor === 'match'"
          @change="setSpine('match')"
        >
        В цвет обложки
      </label>
      <template v-for="color in cover.colors" :key="color.id">
        <label v-if="color.id !== config.coverColor" class="chip" :class="config.spineColor === color.id && 'is-selected'">
          <input
            type="radio"
            name="pb-spine"
            class="sr-only"
            :value="color.id"
            :checked="config.spineColor === color.id"
            @change="setSpine(color.id)"
          >
          <span class="size-3 rounded-full ring-1 ring-black/15" :style="{ backgroundColor: color.hex }" aria-hidden="true" />
          {{ color.label }}
        </label>
      </template>
    </div>
  </fieldset>

  <ul class="flex flex-col gap-2">
    <li v-for="extra in extraOptions" :key="extra.id">
      <label
        class="option-card flex cursor-pointer items-center gap-4 px-4 py-3"
        :class="[config.extras[extra.id] && 'is-selected', unavailableReason(extra.id) && 'is-disabled']"
      >
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-sm font-semibold">{{ extra.label }}</span>
          <span class="text-xs leading-snug text-muted">{{ unavailableReason(extra.id) ?? extra.description }}</span>
        </span>
        <span class="switch">
          <input
            type="checkbox"
            role="switch"
            class="sr-only"
            :checked="config.extras[extra.id] && !unavailableReason(extra.id)"
            :disabled="Boolean(unavailableReason(extra.id))"
            @change="toggleExtra(extra.id, ($event.target as HTMLInputElement).checked)"
          >
        </span>
      </label>
    </li>
  </ul>
</template>
