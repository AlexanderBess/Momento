<script setup lang="ts">
import { photobookFormats } from '~/config/photobook/formats'
import type { FormatId } from '~/types/photobook'

const { config, update } = usePhotobookStudio()

/** Mini silhouette of the format, scaled to fit a 44×44 box. */
function shape(id: FormatId) {
  const format = photobookFormats.find((f) => f.id === id)!
  const scale = 40 / Math.max(format.widthCm, format.heightCm)
  return { width: `${format.widthCm * scale}px`, height: `${format.heightCm * scale}px` }
}

function select(id: FormatId) {
  update({ format: id })
}
</script>

<template>
  <fieldset>
    <legend class="mb-3 text-sm font-semibold">Формат</legend>
    <div class="grid grid-cols-3 gap-2">
      <label
        v-for="format in photobookFormats"
        :key="format.id"
        class="option-card flex cursor-pointer flex-col items-center gap-3 px-2 pt-4 pb-3 text-center"
        :class="config.format === format.id && 'is-selected'"
      >
        <input
          type="radio"
          name="pb-format"
          class="sr-only"
          :value="format.id"
          :checked="config.format === format.id"
          @change="select(format.id)"
        >
        <span class="flex size-11 items-center justify-center" aria-hidden="true">
          <span
            class="rounded-[3px] border transition-colors duration-(--motion-normal)"
            :class="config.format === format.id ? 'border-accent bg-accent-soft' : 'border-muted-soft/60 bg-bg'"
            :style="shape(format.id)"
          />
        </span>
        <span class="flex flex-col">
          <span class="text-sm font-semibold">{{ format.label }}</span>
          <span class="text-xs text-muted tabular-nums">{{ format.widthCm }} × {{ format.heightCm }} см</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
