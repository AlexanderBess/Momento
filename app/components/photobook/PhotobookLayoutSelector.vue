<script setup lang="ts">
import { ChevronLeft, ChevronRight, RefreshCw } from '@lucide/vue'
import { CAPTION_MAX_LENGTH, findLayout, spreadLayouts } from '~/config/photobook/layouts'
import { findImage } from '~/config/photobook/library'
import { ENDPAPER_ID } from '~/lib/photobook'
import type { LayoutId } from '~/types/photobook'

/**
 * Per-spread editing: pick the spread, its layout, swap photos in its slots, edit the caption.
 * Works on the spread shown in the preview; on the endpaper it offers to jump to the first spread.
 */
const { config, activeSpread, spreadIndex, setLayout, setCaption, goTo, pickerTarget, visibleImages } =
  usePhotobookStudio()

const uid = useId()
const onEndpaper = computed(() => config.value.activeSpreadId === ENDPAPER_ID)
const spread = computed(() => activeSpread.value ?? config.value.spreads[0]!)
const layout = computed(() => findLayout(spread.value.layout))
const slotImages = computed(() => visibleImages(spread.value.id).map((id) => findImage(id)))

function stepSpread(delta: number) {
  const next = config.value.spreads[spreadIndex.value + delta]
  if (next) goTo(next.id)
}

function select(id: LayoutId) {
  setLayout(spread.value.id, id)
  goTo(spread.value.id)
}

function replace(slot: number) {
  goTo(spread.value.id)
  pickerTarget.value = { kind: 'slot', spreadId: spread.value.id, slot }
}

function pages(index: number) {
  return `стр. ${index * 2 + 1}–${index * 2 + 2}`
}
</script>

<template>
  <!-- Which spread -->
  <div class="flex items-center gap-3 rounded-card bg-surface-muted p-1.5">
    <button
      type="button"
      class="stepper-button border-transparent!"
      :disabled="!onEndpaper && spreadIndex <= 0"
      aria-label="Предыдущий разворот"
      @click="onEndpaper ? goTo(config.spreads[0]!.id) : stepSpread(-1)"
    >
      <ChevronLeft class="size-4" :stroke-width="2" aria-hidden="true" />
    </button>
    <p class="flex flex-1 flex-col items-center text-center" aria-live="polite">
      <template v-if="onEndpaper">
        <span class="text-sm font-semibold">Форзац</span>
        <span class="text-xs text-muted">выберите разворот для редактирования</span>
      </template>
      <template v-else>
        <span class="text-sm font-semibold">Разворот {{ spreadIndex + 1 }} из {{ config.spreads.length }}</span>
        <span class="text-xs text-muted">{{ pages(spreadIndex) }}</span>
      </template>
    </p>
    <button
      type="button"
      class="stepper-button border-transparent!"
      :disabled="spreadIndex >= config.spreads.length - 1"
      aria-label="Следующий разворот"
      @click="onEndpaper ? goTo(config.spreads[0]!.id) : stepSpread(1)"
    >
      <ChevronRight class="size-4" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>

  <template v-if="!onEndpaper">
    <!-- Layout -->
    <fieldset>
      <legend class="mb-3 flex w-full items-baseline justify-between gap-3 text-sm font-semibold">
        Макет разворота
        <span class="text-xs font-normal text-muted">{{ layout.description }}</span>
      </legend>
      <div class="grid grid-cols-3 gap-2">
        <label
          v-for="item in spreadLayouts"
          :key="item.id"
          class="option-card flex cursor-pointer flex-col items-center gap-2 p-2.5"
          :class="spread.layout === item.id && 'is-selected'"
          :title="item.description"
        >
          <input
            type="radio"
            :name="`${uid}-layout`"
            class="sr-only"
            :value="item.id"
            :checked="spread.layout === item.id"
            :aria-label="`${item.label}: ${item.description}`"
            @change="select(item.id)"
          >
          <!-- Mini diagram drawn from the layout's own slots -->
          <span class="relative aspect-[2/1.15] w-full overflow-hidden rounded-[4px] bg-bg ring-1 ring-border" aria-hidden="true">
            <span class="absolute inset-y-0 left-1/2 w-px bg-border" />
            <span
              v-for="(slot, i) in item.slots"
              :key="i"
              class="absolute rounded-[1.5px] transition-colors duration-(--motion-normal)"
              :class="spread.layout === item.id ? 'bg-accent/70' : 'bg-muted-soft/45'"
              :style="{ left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.w}%`, height: `${slot.h}%` }"
            />
            <span
              v-if="item.caption"
              class="absolute h-[6%] rounded-full bg-muted-soft/60"
              :style="{ left: `${item.caption.x}%`, top: `${item.caption.y + item.caption.h - 10}%`, width: `${item.caption.w * 0.7}%` }"
            />
          </span>
          <span class="text-[0.6875rem] leading-tight font-semibold" aria-hidden="true">{{ item.label }}</span>
        </label>
      </div>
    </fieldset>

    <!-- Photos of this spread -->
    <div>
      <p class="mb-3 text-sm font-semibold">Фотографии на развороте</p>
      <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <li v-for="(image, slot) in slotImages" :key="`${spread.id}-${slot}`">
          <button
            type="button"
            class="group/thumb relative block aspect-square w-full overflow-hidden rounded-[0.75rem] ring-1 ring-border"
            :aria-label="`Заменить фото ${slot + 1}${image ? `: ${image.title}` : ''}`"
            @click="replace(slot)"
          >
            <PhotobookImage :image-id="image?.id" sizes="96px" />
            <span
              class="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/45 to-transparent to-60% p-1.5 text-[0.6875rem] font-semibold text-white"
            >
              <span class="tabular-nums">{{ slot + 1 }}</span>
              <RefreshCw
                class="size-3.5 transition-transform duration-(--motion-normal) group-hover/thumb:rotate-90"
                :stroke-width="2"
                aria-hidden="true"
              />
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Caption -->
    <div v-if="layout.caption">
      <label :for="`${uid}-caption`" class="mb-2 block text-sm font-semibold">Подпись на развороте</label>
      <input
        :id="`${uid}-caption`"
        class="field-input"
        type="text"
        :value="spread.options.caption"
        :maxlength="CAPTION_MAX_LENGTH"
        placeholder="Например, «Первое лето вместе»"
        autocomplete="off"
        @input="setCaption(spread.id, ($event.target as HTMLInputElement).value.slice(0, CAPTION_MAX_LENGTH))"
      >
    </div>
  </template>
</template>
