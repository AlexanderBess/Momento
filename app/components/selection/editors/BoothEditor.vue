<script setup lang="ts">
import { Check } from '@lucide/vue'
import { boothCustomization } from '~/config/booth'
import { eventTypeLabels, eventTypes } from '~/config/order'
import type { BoothConfig, BoothDesignId } from '~/lib/selection'

/** Booth position: event type and design wishes (the same choices as on the booth page). */
const model = defineModel<BoothConfig>({ required: true })
const uid = useId()

function toggleDesign(id: BoothDesignId) {
  const design = model.value.design.includes(id) ? model.value.design.filter((d) => d !== id) : [...model.value.design, id]
  model.value = { ...model.value, design }
}
</script>

<template>
  <div class="grid gap-7">
    <fieldset>
      <legend class="text-sm font-semibold">Тип мероприятия <span class="font-normal text-muted">— необязательно</span></legend>
      <div class="mt-3 flex flex-wrap gap-2">
        <label class="chip" :class="model.eventType === null && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-event`" :checked="model.eventType === null" @change="model = { ...model, eventType: null }">
          Не указан
        </label>
        <label v-for="type in eventTypes" :key="type" class="chip" :class="model.eventType === type && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-event`" :checked="model.eventType === type" @change="model = { ...model, eventType: type }">
          {{ eventTypeLabels[type] }}
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend class="text-sm font-semibold">Оформление <span class="font-normal text-muted">— пожелания, условия обсудим</span></legend>
      <div class="mt-3 grid gap-2">
        <label
          v-for="option in boothCustomization"
          :key="option.id"
          class="option-card flex cursor-pointer items-start gap-4 px-4 py-3.5"
          :class="model.design.includes(option.id) && 'is-selected'"
        >
          <input type="checkbox" class="sr-only" :checked="model.design.includes(option.id)" @change="toggleDesign(option.id)">
          <span
            class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] border transition-colors"
            :class="model.design.includes(option.id) ? 'border-accent bg-accent text-white' : 'border-border bg-surface'"
            aria-hidden="true"
          >
            <Check v-if="model.design.includes(option.id)" class="size-3.5" :stroke-width="3" />
          </span>
          <span class="flex min-w-0 flex-col">
            <span class="text-sm font-semibold">{{ option.label }}</span>
            <span class="text-xs leading-snug text-muted">{{ option.text }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <p class="text-xs leading-relaxed text-muted">Стоимость аренды рассчитаем под дату, продолжительность и площадку.</p>
  </div>
</template>
