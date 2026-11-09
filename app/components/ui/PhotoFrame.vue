<script setup lang="ts">
import { ImageIcon } from '@lucide/vue'
import type { ImageAsset } from '~/types/service'

/**
 * Image with reserved space (no layout shift).
 * While the real photo is missing (`image.src === null`) it renders a neutral,
 * explicitly labelled placeholder — demo visuals are never presented as real work.
 */
const props = withDefaults(
  defineProps<{
    image: ImageAsset
    /**
     * CSS aspect-ratio, e.g. "4 / 5". Defaults to the image's intrinsic ratio.
     * "fill" — no own ratio, stretches to the parent's height (the parent reserves the space).
     */
    ratio?: string
    /** `sizes` attribute for responsive srcset, e.g. "(min-width: 1024px) 50vw, 100vw". */
    sizes?: string
    /** Above-the-fold image: eager loading + high fetch priority + preload. */
    priority?: boolean
    /** Gentle zoom when the parent `group` is hovered (desktop pointers only). */
    zoomOnHover?: boolean
    rounded?: boolean
  }>(),
  { ratio: undefined, sizes: '100vw', priority: false, zoomOnHover: false, rounded: true },
)

const isFill = computed(() => props.ratio === 'fill')
const aspectRatio = computed(() =>
  isFill.value ? undefined : (props.ratio ?? `${props.image.width} / ${props.image.height}`),
)
</script>

<template>
  <div
    class="relative overflow-hidden bg-surface-muted"
    :class="[rounded && 'rounded-card', isFill && 'size-full']"
    :style="{ aspectRatio }"
  >
    <NuxtImg
      v-if="image.src"
      :src="image.src"
      :alt="image.alt"
      :width="image.width"
      :height="image.height"
      :sizes="sizes"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      :preload="priority ? { fetchPriority: 'high' } : false"
      decoding="async"
      class="size-full object-cover"
      :class="
        zoomOnHover &&
        'transition-transform duration-(--motion-slow) ease-standard will-change-transform group-hover:scale-[1.03]'
      "
    />
    <div
      v-else
      role="img"
      :aria-label="`Демонстрационный плейсхолдер: ${image.alt}`"
      class="@container absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-surface-muted via-bg to-accent-soft/60 p-6 text-center"
      :class="
        zoomOnHover && 'transition-transform duration-(--motion-slow) ease-standard group-hover:scale-[1.03]'
      "
    >
      <ImageIcon class="size-7 text-muted-soft" :stroke-width="1.25" aria-hidden="true" />
      <!-- Full label in roomy frames, short one in small frames (container query). -->
      <span class="eyebrow hidden tracking-[0.14em] @[15rem]:inline">Демо · фото будет добавлено</span>
      <span class="eyebrow tracking-[0.14em] @[15rem]:hidden">Демо</span>
    </div>
  </div>
</template>
