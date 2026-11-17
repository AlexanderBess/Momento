<script setup lang="ts">
import { findFormat } from '~/config/photobook/formats'
import { findEndpaper } from '~/config/photobook/materials'
import { ENDPAPER_ID } from '~/lib/photobook'

/**
 * All spreads as miniatures. `strip` — a horizontal ribbon under the open book,
 * `grid` — the "Все развороты" overview. Clicking a miniature opens that spread.
 */
const props = withDefaults(defineProps<{ variant?: 'strip' | 'grid' }>(), { variant: 'strip' })

const { config, goTo } = usePhotobookStudio()

const format = computed(() => findFormat(config.value.format))
const ratio = computed(() => `${format.value.widthCm * 2} / ${format.value.heightCm}`)
const endpaper = computed(() => findEndpaper(config.value.endpaperColor))

const items = computed(() => [
  { id: ENDPAPER_ID, label: 'Форзац', pages: '' },
  ...config.value.spreads.map((spread, i) => ({ id: spread.id, label: `${i + 1}`, pages: `стр. ${i * 2 + 1}–${i * 2 + 2}` })),
])

/* Keep the active miniature in view inside the strip (horizontal scroll only — never the page). */
const list = useTemplateRef<HTMLElement>('list')
watch(
  () => config.value.activeSpreadId,
  async () => {
    if (props.variant !== 'strip') return
    await nextTick()
    const el = list.value?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!el || !list.value) return
    const target = el.offsetLeft - list.value.clientWidth / 2 + el.clientWidth / 2
    list.value.scrollTo({ left: target, behavior: 'smooth' })
  },
)
</script>

<template>
  <ul
    ref="list"
    :class="
      variant === 'strip'
        ? 'no-scrollbar flex snap-x gap-2.5 overflow-x-auto px-1 py-1.5'
        : 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'
    "
    :aria-label="variant === 'strip' ? 'Развороты книги' : undefined"
  >
    <li v-for="item in items" :key="item.id" :class="variant === 'strip' && 'shrink-0 snap-center'">
      <button
        type="button"
        class="group/thumb flex flex-col gap-1.5 text-left"
        :class="variant === 'strip' ? (format.id === 'landscape' ? 'w-36' : format.id === 'portrait' ? 'w-24' : 'w-28') : 'w-full'"
        :aria-current="item.id === config.activeSpreadId"
        :aria-label="item.id === ENDPAPER_ID ? 'Форзац' : `Разворот ${item.label}, ${item.pages}`"
        @click="goTo(item.id)"
      >
        <span
          class="relative block w-full overflow-hidden rounded-[4px] bg-surface ring-1 transition-[box-shadow,translate] duration-(--motion-normal) ease-standard group-hover/thumb:-translate-y-0.5"
          :class="item.id === config.activeSpreadId ? 'ring-2 ring-accent' : 'ring-border'"
          :style="{ aspectRatio: ratio }"
        >
          <span v-if="item.id === ENDPAPER_ID" class="absolute inset-0">
            <MaterialSurface surface="texture" :color="endpaper.hex" />
          </span>
          <SpreadArtwork
            v-else
            :spread="config.spreads.find((s) => s.id === item.id)!"
            :paper-type="config.paperType"
            sizes="160px"
          />
          <span class="absolute inset-y-0 left-1/2 w-px bg-black/12" aria-hidden="true" />
        </span>
        <span
          class="text-[0.6875rem] font-semibold tabular-nums"
          :class="item.id === config.activeSpreadId ? 'text-accent' : 'text-muted'"
          aria-hidden="true"
        >
          {{ item.label }}<span v-if="variant === 'grid' && item.pages" class="font-normal"> · {{ item.pages }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>
