<script setup lang="ts">
import type { ImageAsset } from '~/types/service'

/**
 * Photo frame of the photography page.
 *
 * With a real photo — a plain responsive image with reserved space (no CLS).
 * Without one (`src: null`) — a neutral "viewfinder" frame: warm paper tone, crop marks and a small
 * label. It reads as a deliberate graphic element of the layout and is explicitly marked, so it is
 * never mistaken for a MOMENTO photograph.
 */
const props = withDefaults(
  defineProps<{
    image: ImageAsset
    /** CSS aspect-ratio. Defaults to the image's intrinsic ratio. */
    ratio?: string
    sizes?: string
    priority?: boolean
    /** Small index in the viewfinder corner, e.g. "01". */
    index?: string
    tone?: 'sand' | 'ivory' | 'dark'
    zoomOnHover?: boolean
  }>(),
  { ratio: undefined, sizes: '640px', priority: false, index: undefined, tone: 'sand', zoomOnHover: false },
)

const aspectRatio = computed(() => props.ratio ?? `${props.image.width} / ${props.image.height}`)
</script>

<template>
  <div class="photo-frame relative overflow-hidden" :class="`tone-${tone}`" :style="{ aspectRatio }">
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
        'transition-transform duration-[900ms] ease-enter will-change-transform group-hover:scale-[1.035]'
      "
    />

    <div
      v-else
      role="img"
      :aria-label="`Плейсхолдер, фото будет добавлено: ${image.alt}`"
      class="viewfinder @container absolute inset-0"
    >
      <span class="mark top-3 left-3 border-t border-l" aria-hidden="true" />
      <span class="mark top-3 right-3 border-t border-r" aria-hidden="true" />
      <span class="mark bottom-3 left-3 border-b border-l" aria-hidden="true" />
      <span class="mark right-3 bottom-3 border-r border-b" aria-hidden="true" />
      <span class="focus absolute top-1/2 left-1/2 size-7 -translate-1/2" aria-hidden="true" />
      <span v-if="index" class="frame-text absolute top-5 left-6 font-display text-lg italic" aria-hidden="true">
        {{ index }}
      </span>
      <span
        class="frame-text absolute inset-x-6 bottom-5 hidden text-[0.625rem] font-semibold tracking-[0.18em] uppercase @[11rem]:block"
        aria-hidden="true"
      >
        Фото будет добавлено
      </span>
    </div>
  </div>
</template>

<style scoped>
.photo-frame {
  border-radius: var(--radius-card);
}

.tone-sand {
  --frame-bg: linear-gradient(160deg, #ece5da 0%, #e4dace 55%, #ddd1c2 100%);
  --frame-line: rgb(41 39 36 / 0.22);
  --frame-text: var(--color-muted);
}

.tone-ivory {
  --frame-bg: linear-gradient(160deg, #faf8f4 0%, #f1ece4 100%);
  --frame-line: rgb(41 39 36 / 0.18);
  --frame-text: var(--color-muted);
}

.tone-dark {
  --frame-bg: linear-gradient(160deg, #3a3631 0%, #2f2c28 100%);
  --frame-line: rgb(245 242 237 / 0.22);
  --frame-text: rgb(245 242 237 / 0.6);
}

.photo-frame {
  background: var(--frame-bg);
}

.mark {
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-color: var(--frame-line);
}

.focus {
  background:
    linear-gradient(var(--frame-line), var(--frame-line)) center / 1px 100% no-repeat,
    linear-gradient(var(--frame-line), var(--frame-line)) center / 100% 1px no-repeat;
}

.frame-text {
  color: var(--frame-text);
}
</style>
