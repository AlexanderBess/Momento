<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { findLayout } from '~/config/photobook/layouts'
import { findPaperType } from '~/config/photobook/materials'
import type { PaperTypeId, Spread } from '~/types/photobook'

/**
 * The printed content of one spread: photos in layout slots, caption, paper surface.
 * Pure rendering at "spread size" (fills its parent) — used by the studio preview, thumbnails,
 * collection cards and the hero. With `interactive` every slot becomes a «Заменить фото» button.
 */
const props = withDefaults(
  defineProps<{
    spread: Spread
    paperType: PaperTypeId
    interactive?: boolean
    sizes?: string
    eager?: boolean
    /** Rendered inside one page only: skip slots outside it, put each slot's button on one page. */
    half?: 'left' | 'right'
  }>(),
  { interactive: false, sizes: '260px', eager: false, half: undefined },
)

const emit = defineEmits<{ replace: [slot: number] }>()

const layout = computed(() => findLayout(props.spread.layout))
const paper = computed(() => findPaperType(props.paperType))

type Rect = { x: number; y: number; w: number; h: number }

function inHalf(r: Rect) {
  if (!props.half) return true
  return props.half === 'left' ? r.x < 50 : r.x + r.w > 50
}

/** The page that owns a slot (its centre) — the only one that renders its button or caption. */
function ownsCenter(r: Rect) {
  if (!props.half) return true
  const center = r.x + r.w / 2
  return props.half === 'left' ? center < 50 : center >= 50
}

const slots = computed(() =>
  layout.value.slots.map((slot, index) => ({ slot, index })).filter(({ slot }) => inHalf(slot)),
)

function rect(r: Rect) {
  return { left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }
}
</script>

<template>
  <div class="spread-art absolute inset-0 overflow-hidden" :class="`paper-${paper.surface}`" :style="{ backgroundColor: paper.tone }">
    <div v-for="{ slot, index } in slots" :key="index" class="slot absolute" :style="rect(slot)">
      <PhotobookImage :image-id="spread.images[index]" :sizes="sizes" :eager="eager" />
      <span v-if="paper.surface === 'gloss'" class="gloss pointer-events-none absolute inset-0" aria-hidden="true" />
      <button
        v-if="interactive && ownsCenter(slot)"
        type="button"
        class="slot-button group/slot absolute inset-0 flex items-center justify-center"
        :aria-label="`Заменить фото ${index + 1}`"
        @click="emit('replace', index)"
      >
        <span
          class="pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-surface/92 px-3 py-1.5 text-xs font-semibold text-text opacity-0 shadow-(--shadow-soft) transition-[opacity,translate] duration-(--motion-normal) ease-standard group-hover/slot:translate-y-0 group-hover/slot:opacity-100 group-focus-visible/slot:opacity-100 translate-y-1 max-sm:hidden"
        >
          <RefreshCw class="size-3.5" :stroke-width="2" aria-hidden="true" />
          Заменить фото
        </span>
        <!-- Touch screens: a permanent small marker instead of the hover pill. -->
        <span
          class="pointer-events-none absolute right-1.5 bottom-1.5 inline-flex size-7 items-center justify-center rounded-full bg-surface/90 text-text shadow-(--shadow-soft) sm:hidden"
          aria-hidden="true"
        >
          <RefreshCw class="size-3.5" :stroke-width="2" />
        </span>
      </button>
    </div>

    <p
      v-if="layout.caption && spread.options.caption && ownsCenter(layout.caption)"
      class="caption absolute font-display text-text/85 italic"
      :class="layout.caption.align === 'center' && 'text-center'"
      :style="rect(layout.caption)"
    >
      {{ spread.options.caption }}
    </p>

    <span v-if="paper.surface === 'texture'" class="texture pointer-events-none absolute inset-0" aria-hidden="true" />
  </div>
</template>

<style scoped>
.spread-art {
  container-type: inline-size;
}

.caption {
  display: flex;
  align-items: flex-end;
  font-size: max(6px, 2.6cqw);
  line-height: 1.15;
  overflow: hidden;
}

.slot-button {
  cursor: pointer;
  transition: background-color var(--motion-normal) var(--ease-standard);
}

.slot-button:hover,
.slot-button:focus-visible {
  background-color: rgb(41 39 36 / 0.12);
}

.slot-button:focus-visible {
  outline-offset: -3px;
}

/* Glossy paper: a soft diagonal reflection over photos. */
.gloss {
  background: linear-gradient(115deg, transparent 30%, rgb(255 255 255 / 0.28) 46%, transparent 58%);
  mix-blend-mode: screen;
}

.paper-gloss .slot :deep(.pb-image) {
  filter: saturate(1.12) contrast(1.04);
}

.paper-matte .slot :deep(.pb-image) {
  filter: saturate(0.94);
}

/* Textured paper: visible tooth over the whole page, photos included. */
.texture {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3CfeDiffuseLighting lighting-color='%23fff' surfaceScale='1.6'%3E%3CfeDistantLight azimuth='45' elevation='58'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23t)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
  opacity: 0.38;
}

.paper-texture .slot :deep(.pb-image) {
  filter: saturate(0.9) contrast(0.96);
}
</style>
