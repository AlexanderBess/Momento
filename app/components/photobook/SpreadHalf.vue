<script setup lang="ts">
import { findEndpaper, findPaperType } from '~/config/photobook/materials'
import { ENDPAPER_ID } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

/**
 * One page (left or right half) of a spread. The spread content is rendered at full spread width
 * and clipped, so layouts that run across the gutter stay continuous — and the page-turn leaf can
 * show "the right half of spread A" on its front and "the left half of spread B" on its back.
 */
const props = withDefaults(
  defineProps<{
    config: Pick<PhotobookConfig, 'spreads' | 'paperType' | 'endpaperColor'>
    spreadId: string
    side: 'left' | 'right'
    interactive?: boolean
    sizes?: string
  }>(),
  { interactive: false, sizes: '260px' },
)

const emit = defineEmits<{ replace: [slot: number] }>()

const spread = computed(() => props.config.spreads.find((s) => s.id === props.spreadId))
const endpaper = computed(() => findEndpaper(props.config.endpaperColor))
const paper = computed(() => findPaperType(props.config.paperType))
</script>

<template>
  <div class="absolute inset-y-0 w-1/2 overflow-hidden" :class="side === 'left' ? 'left-0' : 'left-1/2'">
    <div class="absolute inset-y-0 w-[200%]" :class="side === 'left' ? 'left-0' : '-left-full'">
      <template v-if="spreadId === ENDPAPER_ID">
        <!-- Left: endpaper pasted to the board. Right: the free flyleaf. -->
        <div class="absolute inset-y-0 left-0 w-1/2">
          <MaterialSurface surface="texture" :color="endpaper.hex" />
        </div>
        <div class="absolute inset-y-0 right-0 w-1/2">
          <MaterialSurface surface="texture" :color="endpaper.hex" />
          <span class="absolute inset-0 bg-linear-to-r from-black/6 to-transparent to-20%" aria-hidden="true" />
        </div>
      </template>
      <SpreadArtwork
        v-else-if="spread"
        :spread="spread"
        :paper-type="config.paperType"
        :interactive="interactive"
        :half="side"
        :sizes="sizes"
        @replace="emit('replace', $event)"
      />
      <div v-else class="absolute inset-0" :style="{ backgroundColor: paper.tone }" />
    </div>
  </div>
</template>
