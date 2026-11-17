<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'
import { pageCountsFor, plural, spreadCountFor } from '~/config/photobook/formats'

/** Page count: a stepper over the configured options plus the options as chips. */
const { config, update } = usePhotobookStudio()

const options = computed(() => pageCountsFor(config.value.format))
const index = computed(() => options.value.indexOf(config.value.pageCount))
const spreads = computed(() => spreadCountFor(config.value.pageCount))

function step(delta: number) {
  const next = options.value[index.value + delta]
  if (next) update({ pageCount: next })
}
</script>

<template>
  <fieldset>
    <legend class="mb-3 text-sm font-semibold">Количество страниц</legend>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="stepper-button"
        :disabled="index <= 0"
        aria-label="Меньше страниц"
        @click="step(-1)"
      >
        <Minus class="size-4" :stroke-width="2" aria-hidden="true" />
      </button>
      <p class="flex min-w-0 flex-1 flex-col items-center text-center" aria-live="polite">
        <span class="text-[1.75rem] leading-none font-semibold tabular-nums">{{ config.pageCount }}</span>
        <span class="mt-1 text-xs text-muted">
          {{ plural(config.pageCount, ['страница', 'страницы', 'страниц']) }} · {{ spreads }}
          {{ plural(spreads, ['разворот', 'разворота', 'разворотов']) }} + обложка
        </span>
      </p>
      <button
        type="button"
        class="stepper-button"
        :disabled="index >= options.length - 1"
        aria-label="Больше страниц"
        @click="step(1)"
      >
        <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <label v-for="count in options" :key="count" class="chip" :class="config.pageCount === count && 'is-selected'">
        <input
          type="radio"
          name="pb-pages"
          class="sr-only"
          :value="count"
          :checked="config.pageCount === count"
          @change="update({ pageCount: count })"
        >
        <span class="tabular-nums">{{ count }}</span>
      </label>
    </div>
  </fieldset>
</template>
