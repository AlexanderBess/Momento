<script setup lang="ts">
import type { ImageAsset } from '~/types/service'

withDefaults(defineProps<{
  image: ImageAsset
  ratio: string
  sizes: string
  tone?: 'neutral' | 'warm' | 'sage'
  priority?: boolean
}>(), { tone: 'neutral', priority: false })

const backgrounds = {
  neutral: 'bg-service-bg',
  warm: 'bg-[#ece2d5]',
  sage: 'bg-[#e3e8de]',
}

const failed = ref(false)
</script>

<template>
  <figure class="relative overflow-hidden" :class="backgrounds[tone]" :style="{ aspectRatio: ratio }">
    <template v-if="image.src && !failed">
      <NuxtImg
        :src="image.src"
        :alt="image.alt"
        :width="image.width"
        :height="image.height"
        :sizes="sizes"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        class="size-full object-contain px-[7%] pt-3 pb-9 sm:pt-4 sm:pb-10"
        @error="failed = true"
      />
      <figcaption class="absolute right-3 bottom-2 text-right text-xs text-muted sm:right-4 sm:bottom-3">
        Демонстрационный образец
      </figcaption>
    </template>
    <PhotoFrame v-else :image="{ ...image, src: null }" ratio="fill" :rounded="false" />
  </figure>
</template>
