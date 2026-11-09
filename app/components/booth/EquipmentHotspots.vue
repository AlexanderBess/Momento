<script setup lang="ts">
import { Plus } from '@lucide/vue'
import type { EquipmentHotspot } from '~/config/booth'
import type { ImageAsset } from '~/types/service'

/**
 * Image with explanatory hotspots.
 * Click / tap toggles a point everywhere; on devices with a real hover, hovering also previews it.
 * Esc or a click outside closes the open point. Each point is a button with aria-expanded.
 */
const props = defineProps<{ image: ImageAsset; hotspots: EquipmentHotspot[]; sizes?: string }>()

const openId = ref<string | null>(null)
const root = useTemplateRef<HTMLDivElement>('root')
let canHover = false

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}

function onEnter(id: string) {
  if (canHover) openId.value = id
}

function onLeave(id: string) {
  if (canHover && openId.value === id) openId.value = null
}

function onDocumentPointer(event: PointerEvent) {
  if (openId.value && !root.value?.contains(event.target as Node)) openId.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && openId.value) openId.value = null
}

// Document listeners exist only while a hotspot is open.
watch(openId, (id) => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  if (id) document.addEventListener('pointerdown', onDocumentPointer)
})

onMounted(() => {
  canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointer))

// Panel opens below the point; near an edge it aligns to that edge so it never leaves the image.
const panelAlign = (spot: EquipmentHotspot) =>
  spot.x < 30 ? 'left-0' : spot.x > 70 ? 'right-0' : 'left-1/2 -translate-x-1/2'

const { isInView } = useInView(root, { once: true })
</script>

<template>
  <div ref="root" class="relative" :class="isInView && 'hotspots-live'" @keydown="onKeydown">
    <PhotoFrame :image="props.image" :sizes="sizes ?? '(min-width: 1024px) 480px, 100vw'" />

    <div
      v-for="(spot, index) in hotspots"
      :key="spot.id"
      class="absolute"
      :class="openId === spot.id ? 'z-20' : 'z-10'"
      :style="{ left: `${spot.x}%`, top: `${spot.y}%`, translate: '-50% -50%' }"
      @mouseenter="onEnter(spot.id)"
      @mouseleave="onLeave(spot.id)"
    >
      <button
        type="button"
        class="hotspot inline-flex size-11 items-center justify-center rounded-full"
        :style="{ '--hotspot-delay': `${300 + index * 120}ms` }"
        :aria-expanded="openId === spot.id"
        :aria-controls="`hotspot-${spot.id}`"
        :aria-label="spot.title"
        @click="toggle(spot.id)"
      >
        <span
          class="inline-flex size-7 items-center justify-center rounded-full shadow-(--shadow-raised) ring-4 ring-surface/40 transition-[rotate,background-color,color] duration-(--motion-normal) ease-standard"
          :class="openId === spot.id ? 'rotate-45 bg-accent text-white' : 'bg-surface text-accent'"
          aria-hidden="true"
        >
          <Plus class="size-4" :stroke-width="2.25" />
        </span>
      </button>

      <Transition name="hotspot-pop">
        <div
          v-show="openId === spot.id"
          :id="`hotspot-${spot.id}`"
          class="absolute top-full mt-1 w-56 rounded-card bg-surface p-4 text-left shadow-(--shadow-raised) sm:w-64"
          :class="panelAlign(spot)"
        >
          <p class="font-semibold">{{ spot.title }}</p>
          <p class="mt-1 text-sm leading-relaxed text-muted">{{ spot.text }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  /* Points appear one by one once the image is on screen. Before that they are simply visible. */
  .hotspots-live .hotspot {
    animation: hotspot-in 500ms var(--ease-enter) var(--hotspot-delay) both;
  }
}

@keyframes hotspot-in {
  from {
    opacity: 0;
    scale: 0.6;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}

.hotspot-pop-enter-active,
.hotspot-pop-leave-active {
  transition:
    opacity var(--motion-normal) var(--ease-standard),
    scale var(--motion-normal) var(--ease-enter);
}

.hotspot-pop-enter-from,
.hotspot-pop-leave-to {
  opacity: 0;
  scale: 0.96;
}
</style>
