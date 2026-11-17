<script setup lang="ts">
import { paperTypes } from '~/config/photobook/materials'
import type { PaperTypeId } from '~/types/photobook'

const { config, update, focusView } = usePhotobookStudio()

/** Paper is visible inside the book → show the open spread. */
function select(id: PaperTypeId) {
  update({ paperType: id })
  focusView('spread')
}
</script>

<template>
  <fieldset>
    <legend class="sr-only">Бумага внутренних страниц</legend>
    <div class="flex flex-col gap-2">
      <label
        v-for="paper in paperTypes"
        :key="paper.id"
        class="option-card flex cursor-pointer items-center gap-4 p-2.5 pr-4"
        :class="config.paperType === paper.id && 'is-selected'"
      >
        <input
          type="radio"
          name="pb-paper"
          class="sr-only"
          :value="paper.id"
          :checked="config.paperType === paper.id"
          @change="select(paper.id)"
        >
        <span class="relative size-14 shrink-0 overflow-hidden rounded-[0.625rem] ring-1 ring-border" aria-hidden="true">
          <MaterialSurface :surface="paper.surface" :color="paper.tone" />
        </span>
        <span class="flex min-w-0 flex-col gap-0.5">
          <span class="text-sm font-semibold">{{ paper.label }} бумага</span>
          <span class="text-xs leading-snug text-muted">{{ paper.description }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
