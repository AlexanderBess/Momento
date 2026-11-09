<script setup lang="ts">
import { ChevronsLeftRight } from '@lucide/vue'
import type { ImageAsset } from '~/types/service'

/**
 * Before / After comparison.
 *
 * - Mouse, pen and touch via Pointer Events (pointer capture, so the drag continues outside the frame).
 *   `touch-action: pan-y` keeps vertical page scrolling on phones; horizontal drags move the divider.
 * - Keyboard: the handle is a `role="slider"` — ←/→ (5%), PageUp/PageDown (20%), Home/End.
 * - The position is one CSS variable; both layers move with transforms only (no clip-path / width animation).
 * - `demo` plays one short hint movement; it stops for good on the first user interaction.
 */
const props = withDefaults(
  defineProps<{
    before: ImageAsset
    after: ImageAsset
    beforeLabel?: string
    afterLabel?: string
    sizes?: string
    /** Play a one-off hint animation when this becomes true. */
    demo?: boolean
  }>(),
  { beforeLabel: 'Оригинал', afterLabel: 'AI-образ', sizes: '(min-width: 1024px) 560px, 100vw', demo: false },
)

const position = ref(50)
const dragging = ref(false)
const interacted = ref(false)
const frame = useTemplateRef<HTMLDivElement>('frame')

const clamp = (value: number) => Math.min(100, Math.max(0, value))

/* ---------- Pointer ---------- */

let rect: DOMRect | null = null
let raf = 0
let pendingX = 0

function applyPointer() {
  raf = 0
  if (!rect) return
  position.value = clamp(((pendingX - rect.left) / rect.width) * 100)
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  stopDemo()
  interacted.value = true
  dragging.value = true
  rect = frame.value!.getBoundingClientRect()
  frame.value!.setPointerCapture(event.pointerId)
  pendingX = event.clientX
  applyPointer()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  pendingX = event.clientX
  if (!raf) raf = requestAnimationFrame(applyPointer)
}

function onPointerUp(event: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  frame.value?.releasePointerCapture(event.pointerId)
}

/* ---------- Keyboard ---------- */

function onKeydown(event: KeyboardEvent) {
  const steps: Record<string, number> = {
    ArrowLeft: -5,
    ArrowDown: -5,
    ArrowRight: 5,
    ArrowUp: 5,
    PageDown: -20,
    PageUp: 20,
  }
  let next: number | null = null
  if (event.key in steps) next = position.value + steps[event.key]!
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = 100
  if (next === null) return
  event.preventDefault()
  stopDemo()
  interacted.value = true
  position.value = clamp(next)
}

/* ---------- One-off demo ---------- */

let demoRaf = 0

function stopDemo() {
  if (demoRaf) cancelAnimationFrame(demoRaf)
  demoRaf = 0
}

function playDemo() {
  if (interacted.value) return
  // 50 → 66 → 36 → 50 over ~1.8 s, eased.
  const keys = [50, 66, 36, 50]
  const duration = 1800
  const start = performance.now()
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const segment = Math.min(keys.length - 2, Math.floor(t * (keys.length - 1)))
    const local = t * (keys.length - 1) - segment
    position.value = keys[segment]! + (keys[segment + 1]! - keys[segment]!) * ease(local)
    demoRaf = t < 1 ? requestAnimationFrame(tick) : 0
  }
  demoRaf = requestAnimationFrame(tick)
}

watch(
  () => props.demo,
  (run) => {
    if (run) playDemo()
  },
)

// New pair of images → start from the middle again.
watch(
  () => props.after.alt,
  () => {
    stopDemo()
    position.value = 50
  },
)

onBeforeUnmount(() => {
  stopDemo()
  if (raf) cancelAnimationFrame(raf)
})

const ariaValueText = computed(
  () => `${props.beforeLabel} ${Math.round(position.value)}%, ${props.afterLabel} ${Math.round(100 - position.value)}%`,
)
</script>

<template>
  <div
    ref="frame"
    class="ba-frame group/ba relative isolate cursor-ew-resize touch-pan-y overflow-hidden rounded-card bg-surface-muted select-none"
    :class="dragging && 'is-dragging'"
    :style="{ '--ba-pos': position, aspectRatio: `${after.width} / ${after.height}` }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- After: full frame underneath -->
    <div class="absolute inset-0">
      <PhotoFrame :image="after" ratio="fill" :rounded="false" :sizes="sizes" />
      <!-- While real images are missing, tint the AI side so the two halves are distinguishable. -->
      <div
        v-if="!after.src"
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(117_100_168/0.38),rgb(117_100_168/0.08)_55%,rgb(41_39_36/0.18))]"
        aria-hidden="true"
      />
    </div>

    <!-- Before: the wrapper slides left, its content slides back right → a moving window. -->
    <div class="ba-before absolute inset-0 overflow-hidden">
      <div class="ba-before-inner absolute inset-0">
        <PhotoFrame :image="before" ratio="fill" :rounded="false" :sizes="sizes" />
      </div>
    </div>

    <!-- Labels -->
    <span
      class="pointer-events-none absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-text shadow-(--shadow-soft)"
    >
      {{ beforeLabel }}
    </span>
    <span
      class="pointer-events-none absolute top-3 right-3 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-(--shadow-soft)"
    >
      {{ afterLabel }}
    </span>

    <!-- Divider + handle -->
    <div class="ba-divider pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-surface shadow-[0_0_0_1px_rgb(41_39_36/0.06)]">
      <div
        role="slider"
        tabindex="0"
        aria-orientation="horizontal"
        :aria-label="`Сравнение: ${beforeLabel} и ${afterLabel}`"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(position)"
        :aria-valuetext="ariaValueText"
        class="pointer-events-auto absolute top-1/2 left-1/2 inline-flex size-12 -translate-1/2 items-center justify-center rounded-full bg-surface text-text shadow-(--shadow-raised) transition-transform duration-(--motion-normal) ease-standard group-hover/ba:scale-105 group-[.is-dragging]/ba:scale-95"
        @keydown="onKeydown"
      >
        <ChevronsLeftRight class="size-5" :stroke-width="1.75" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --ba-pos: 0…100 (unitless). Only transforms move, so dragging stays on the compositor. */
.ba-before {
  transform: translateX(calc((var(--ba-pos) - 100) * 1%));
}

.ba-before-inner {
  transform: translateX(calc((100 - var(--ba-pos)) * 1%));
}

.ba-divider {
  transform: translateX(calc(var(--ba-pos) * 1cqw - 1px));
}

.ba-frame {
  container-type: inline-size;
}

/* Smooth glide for clicks and keyboard steps; instant while dragging so it sticks to the finger. */
.ba-before,
.ba-before-inner,
.ba-divider {
  transition: transform 220ms var(--ease-standard);
}

.is-dragging .ba-before,
.is-dragging .ba-before-inner,
.is-dragging .ba-divider {
  transition: none;
}
</style>
