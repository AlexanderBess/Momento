<script setup lang="ts">
import { ArrowRight, Check, Plus } from '@lucide/vue'
import {
  findConcept,
  photozoneCategoryNames,
  photozoneOptions,
  photozonePricing,
} from '~/config/photozones'
import { photozonePrice } from '~/lib/selection'

/*
 * Details of a ready concept in the shared BaseDialog (bottom sheet on phones): gallery, description,
 * size, composition, suitable events, base price and add-on options.
 * The footer can add or update a concept in the selection, then optionally open the request form.
 * Options are remembered per concept while on the page.
 * Positions already in the selection are edited in «Моя подборка» (ItemEditor).
 */
const { openConceptId, optionsOf, toggleOption, addReady, submitReady, isInCart, isUpToDate } = usePhotozoneOrder()

const concept = computed(() => (openConceptId.value ? findConcept(openConceptId.value) : undefined))
const open = computed({
  get: () => Boolean(concept.value),
  set: (value) => {
    if (!value) openConceptId.value = null
  },
})

const active = ref(0)
watch(openConceptId, () => (active.value = 0))

const options = computed(() => (concept.value ? optionsOf(concept.value.id) : []))
const price = computed(() => (concept.value ? photozonePrice(concept.value, options.value) : null))

const meters = (n: number) => n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
const size = computed(() => {
  const d = concept.value?.dimensions
  if (!d) return ''
  return `${meters(d.width)} × ${meters(d.height)}${d.depth ? ` × ${meters(d.depth)}` : ''} м`
})

const state = computed(() => {
  if (!concept.value || !isInCart(concept.value.id)) return 'new'
  return isUpToDate(concept.value.id) ? 'in-cart' : 'changed'
})

const addLabel = computed(() =>
  state.value === 'new' ? 'Добавить в подборку' : state.value === 'changed' ? 'Обновить в подборке' : 'Уже в подборке',
)

// The dialog closes in the same tick, so the toast / confirmation is never hidden behind it.
function add() {
  const id = concept.value?.id
  if (!id) return
  openConceptId.value = null
  addReady(id)
}

function submit() {
  const id = concept.value?.id
  if (!id) return
  openConceptId.value = null
  submitReady(id)
}
</script>

<template>
  <BaseDialog v-model:open="open" :title="concept?.title ?? 'Фотозона'" size="lg">
    <div v-if="concept" class="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8">
      <!-- ---------- Gallery ---------- -->
      <div class="sm:sticky sm:top-0 sm:self-start">
        <PhotozoneVisual :key="active" :asset="concept.gallery[active]!" ratio="4 / 5" sizes="640px sm:420px" />
        <div v-if="concept.gallery.length > 1" class="mt-3 flex gap-2" role="group" aria-label="Изображения концепции">
          <button
            v-for="(item, i) in concept.gallery"
            :key="i"
            type="button"
            class="w-16 overflow-hidden rounded-input ring-offset-2 ring-offset-bg transition-shadow"
            :class="i === active ? 'ring-2 ring-text' : 'opacity-75 hover:opacity-100'"
            :aria-label="`Изображение ${i + 1} из ${concept.gallery.length}`"
            :aria-pressed="i === active"
            @click="active = i"
          >
            <PhotozoneVisual :asset="item" ratio="4 / 5" :label="false" :rounded="false" sizes="80px" />
          </button>
        </div>
      </div>

      <!-- ---------- Info ---------- -->
      <div class="flex flex-col">
        <div class="flex flex-wrap items-center gap-3">
          <p class="eyebrow text-(--color-accent)">{{ photozoneCategoryNames[concept.category] }}</p>
          <span class="h-px w-8 bg-service-accent/40" aria-hidden="true" />
          <p class="eyebrow">Концепция оформления</p>
        </div>
        <p class="mt-4 text-[0.9375rem] leading-relaxed">{{ concept.description }}</p>

        <dl class="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 border-y border-border py-5 text-sm">
          <dt class="text-muted">Размеры</dt>
          <dd class="font-semibold">{{ size }}</dd>
          <dt class="text-muted">Подходит для</dt>
          <dd>{{ concept.suitableFor.join(', ') }}</dd>
        </dl>

        <h3 class="mt-6 text-sm font-semibold">Состав декорации</h3>
        <ul class="mt-3 grid gap-2 text-[0.9375rem] text-muted">
          <li v-for="item in concept.composition" :key="item" class="flex gap-3">
            <span class="mt-2.5 h-px w-3 shrink-0 bg-service-accent" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>

        <fieldset class="mt-8">
          <legend class="text-sm font-semibold">Дополнительные опции</legend>
          <div class="mt-3 grid gap-2">
            <label
              v-for="option in photozoneOptions"
              :key="option.id"
              class="option-card flex cursor-pointer items-center gap-4 px-4 py-3.5"
              :class="options.includes(option.id) && 'is-selected'"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="options.includes(option.id)"
                @change="toggleOption(concept.id, option.id)"
              >
              <span
                class="inline-flex size-5 shrink-0 items-center justify-center rounded-[0.375rem] border transition-colors"
                :class="options.includes(option.id) ? 'border-(--color-accent) bg-(--color-accent) text-white' : 'border-border bg-surface'"
                aria-hidden="true"
              >
                <Check v-if="options.includes(option.id)" class="size-3.5" :stroke-width="3" />
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

        <p class="mt-6 text-xs leading-relaxed text-muted">
          Декорации предоставляются в аренду и остаются собственностью MOMENTO. Стоимость доставки зависит от
          расположения площадки и уточняется при согласовании.
        </p>
      </div>
    </div>

    <template v-if="concept" #footer>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p class="flex flex-col" aria-live="polite">
          <span class="text-xs text-muted">Базовая аренда {{ options.length ? '+ опции' : '' }}</span>
          <span class="text-xl font-semibold tabular-nums">
            <template v-if="price?.total !== null && price?.total !== undefined">
              {{ formatRub(price.total) }}<template v-if="price.partial"> + обсуждается</template>
            </template>
            <template v-else>Стоимость обсуждается</template>
          </span>
          <span v-if="price?.total !== null && photozonePricing.isDemo" class="text-xs text-muted">
            Демо-цена · без учёта доставки
          </span>
        </p>
        <div class="flex flex-col gap-2 sm:flex-row">
          <BaseButton variant="secondary" class="w-full sm:w-auto" @click="add">
            <component :is="state === 'in-cart' ? Check : Plus" class="size-4" :stroke-width="2" aria-hidden="true" />
            {{ addLabel }}
          </BaseButton>
          <BaseButton class="w-full sm:w-auto" @click="submit">
            К оформлению заявки
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>
