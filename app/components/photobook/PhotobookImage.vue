<script setup lang="ts">
import { ImageOff } from '@lucide/vue'
import { findImage } from '~/config/photobook/library'

/**
 * One library image, filling its parent (object-fit: cover).
 * Real photo when `src` exists, otherwise the procedural demo illustration.
 * A broken photo falls back to the illustration, an unknown id — to a neutral "missing" state.
 */
const props = withDefaults(defineProps<{ imageId: string | undefined; sizes?: string; eager?: boolean }>(), {
  sizes: '320px',
  eager: false,
})

const image = computed(() => findImage(props.imageId))
const failed = ref(false)
watch(
  () => props.imageId,
  () => (failed.value = false),
)
</script>

<template>
  <div class="pb-image relative size-full overflow-hidden" :class="image && !image.src && 'is-art'">
    <template v-if="image">
      <NuxtImg
        v-if="image.src && !failed"
        :src="image.src"
        :alt="image.alt"
        :sizes="sizes"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        class="size-full object-cover"
        @error="failed = true"
      />
      <DemoArtwork v-else :art="image.art" />
    </template>
    <div v-else class="flex size-full items-center justify-center bg-surface-muted text-muted-soft">
      <ImageOff class="size-5" :stroke-width="1.5" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
/* Fine grain over the flat illustrations — reads as a printed image, not a vector icon. */
.pb-image.is-art::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
  opacity: 0.32;
}
</style>
