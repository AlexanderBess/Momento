<script setup lang="ts">
import { Check } from '@lucide/vue'
import { findConcept, photozoneOptions, type PhotozoneOptionId } from '~/config/photozones'
import { photozonePrice, type PhotozoneConfig } from '~/lib/selection'

/** One photo zone position: options of a ready concept, or the idea of an individual project. */
const model = defineModel<PhotozoneConfig>({ required: true })
const uid = useId()

const concept = computed(() => (model.value.orderType === 'ready' ? findConcept(model.value.conceptId) : undefined))
const price = computed(() => (concept.value && model.value.orderType === 'ready' ? photozonePrice(concept.value, model.value.options) : null))

function toggle(id: PhotozoneOptionId) {
  if (model.value.orderType !== 'ready') return
  const options = model.value.options.includes(id) ? model.value.options.filter((o) => o !== id) : [...model.value.options, id]
  model.value = { ...model.value, options }
}
</script>

<template>
  <div v-if="model.orderType === 'ready' && concept" class="grid gap-6">
    <div class="flex items-start gap-4">
      <div class="w-20 shrink-0">
        <PhotozoneVisual :asset="concept.gallery[0]!" ratio="4 / 5" :label="false" sizes="80px" />
      </div>
      <p class="text-sm leading-relaxed text-muted">{{ concept.description }}</p>
    </div>

    <fieldset>
      <legend class="text-sm font-semibold">Дополнительные опции</legend>
      <div class="mt-3 grid gap-2">
        <label
          v-for="option in photozoneOptions"
          :key="option.id"
          class="option-card flex cursor-pointer items-center gap-4 px-4 py-3.5"
          :class="model.options.includes(option.id) && 'is-selected'"
        >
          <input type="checkbox" class="sr-only" :checked="model.options.includes(option.id)" @change="toggle(option.id)">
          <span
            class="inline-flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] border transition-colors"
            :class="model.options.includes(option.id) ? 'border-accent bg-accent text-white' : 'border-border bg-surface'"
            aria-hidden="true"
          >
            <Check v-if="model.options.includes(option.id)" class="size-3.5" :stroke-width="3" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-sm font-semibold">{{ option.label }}</span>
            <span class="text-xs text-muted">{{ option.description }}</span>
          </span>
          <span class="shrink-0 text-right text-sm tabular-nums" :class="option.price === null && 'text-muted'">
            {{ option.price === null ? 'обсуждается' : `+ ${formatRub(option.price)}` }}
          </span>
        </label>
      </div>
    </fieldset>

    <p class="flex flex-col" aria-live="polite">
      <span class="text-xs text-muted">Базовая аренда{{ model.options.length ? ' + опции' : '' }}</span>
      <span class="text-lg font-semibold tabular-nums">
        <template v-if="price && price.total !== null">
          {{ formatRub(price.total) }}<template v-if="price.partial"> + обсуждается</template>
        </template>
        <template v-else>Стоимость обсуждается</template>
      </span>
      <span v-if="price && price.total !== null && price.isDemo" class="text-xs text-muted">Демо-цена · без учёта доставки</span>
    </p>
  </div>

  <div v-else-if="model.orderType === 'custom'" class="grid gap-3">
    <p class="text-sm leading-relaxed text-muted">
      Индивидуальный проект — фотозона под ваше мероприятие. Стоимость рассчитаем после обсуждения.
    </p>
    <label :for="`${uid}-notes`" class="text-sm font-semibold">
      Идея и пожелания <span class="font-normal text-muted">— необязательно</span>
    </label>
    <textarea
      :id="`${uid}-notes`"
      class="field-input min-h-28 resize-y"
      rows="4"
      maxlength="600"
      placeholder="Тематика, цвета, размеры площадки, референсы"
      :value="model.notes"
      @input="model = { ...model, notes: ($event.target as HTMLTextAreaElement).value }"
    />
  </div>
</template>
