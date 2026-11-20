<script setup lang="ts">
import { Check } from '@lucide/vue'
import { photographyPackages, type PhotographyExtraId } from '~/config/photography'
import { availablePhotographyExtras, photographyDirections, type PhotographyConfig } from '~/lib/selection'

/** Photography position: direction, package and add-ons (same options as the pricing section). */
const model = defineModel<PhotographyConfig>({ required: true })
const uid = useId()

const priceLabel = (price: number | null) => (price === null ? 'по запросу' : formatRub(price))

function toggleExtra(id: PhotographyExtraId) {
  const extras = model.value.extras.includes(id) ? model.value.extras.filter((e) => e !== id) : [...model.value.extras, id]
  model.value = { ...model.value, extras }
}
</script>

<template>
  <div class="grid gap-7">
    <fieldset>
      <legend class="text-sm font-semibold">Направление <span class="font-normal text-muted">— необязательно</span></legend>
      <div class="mt-3 flex flex-wrap gap-2">
        <label class="chip" :class="model.direction === null && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-direction`" :checked="model.direction === null" @change="model = { ...model, direction: null }">
          Обсудим
        </label>
        <label v-for="d in photographyDirections" :key="d.id" class="chip" :class="model.direction === d.id && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-direction`" :checked="model.direction === d.id" @change="model = { ...model, direction: d.id }">
          {{ d.label }}
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend class="text-sm font-semibold">Пакет</legend>
      <div class="mt-3 grid gap-2">
        <label
          v-for="pkg in photographyPackages"
          :key="pkg.id"
          class="option-card flex cursor-pointer items-center gap-4 px-4 py-3.5"
          :class="model.package === pkg.id && 'is-selected'"
        >
          <input type="radio" class="sr-only" :name="`${uid}-package`" :checked="model.package === pkg.id" @change="model = { ...model, package: pkg.id }">
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-sm font-semibold">{{ pkg.name }} — {{ pkg.title }}</span>
            <span class="text-xs text-muted">До {{ pkg.durationHours }} {{ pkg.durationHours === 1 ? 'часа' : 'часов' }} съёмки</span>
          </span>
          <span class="shrink-0 text-sm text-muted tabular-nums">{{ priceLabel(pkg.price) }}</span>
        </label>
        <label class="option-card flex cursor-pointer items-center gap-4 px-4 py-3.5" :class="model.package === null && 'is-selected'">
          <input type="radio" class="sr-only" :name="`${uid}-package`" :checked="model.package === null" @change="model = { ...model, package: null }">
          <span class="text-sm font-semibold">Подобрать вместе</span>
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend class="text-sm font-semibold">Дополнительно</legend>
      <div class="mt-3 grid gap-2">
        <label
          v-for="extra in availablePhotographyExtras"
          :key="extra.id"
          class="option-card flex cursor-pointer items-center gap-4 px-4 py-3.5"
          :class="model.extras.includes(extra.id) && 'is-selected'"
        >
          <input type="checkbox" class="sr-only" :checked="model.extras.includes(extra.id)" @change="toggleExtra(extra.id)">
          <span
            class="inline-flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] border transition-colors"
            :class="model.extras.includes(extra.id) ? 'border-accent bg-accent text-white' : 'border-border bg-surface'"
            aria-hidden="true"
          >
            <Check v-if="model.extras.includes(extra.id)" class="size-3.5" :stroke-width="3" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-sm font-semibold">{{ extra.title }}</span>
            <span class="text-xs text-muted">{{ extra.description }}</span>
          </span>
          <span class="shrink-0 text-sm text-muted tabular-nums">{{ priceLabel(extra.price) }}</span>
        </label>
      </div>
    </fieldset>
  </div>
</template>
