<script setup lang="ts">
import { findCoverColor, findCoverType } from '~/config/photobook/covers'
import { findFormat } from '~/config/photobook/formats'
import { ENDPAPER_ID } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

/**
 * Open photobook: cover boards, page block edges, the gutter and the current spread.
 *
 * Navigation between spreads turns a real "leaf": its front shows the outgoing page, its back the
 * incoming one, so the motion reads as a physical page turn. Pure CSS 3D, ~0.7 s, skipped for
 * reduced motion. Size is CSS-only (container query units) and follows the chosen format.
 */
const props = withDefaults(
  defineProps<{
    config: PhotobookConfig
    spreadId: string
    interactive?: boolean
    /** Fraction of the container the open book may take: width / height. */
    fit?: [number, number]
    sizes?: string
  }>(),
  { interactive: false, fit: () => [0.94, 0.86], sizes: '320px lg:380px' },
)

const emit = defineEmits<{ replace: [spreadId: string, slot: number] }>()

const format = computed(() => findFormat(props.config.format))
const cover = computed(() => findCoverType(props.config.coverType))
const boardColor = computed(() => {
  const id = cover.value.usesPhoto || props.config.spineColor === 'match' ? props.config.coverColor : props.config.spineColor
  return findCoverColor(props.config.coverType, id).hex
})

/** Visible page-block layers at the outer edges: more pages → a thicker stack. */
const stackLayers = computed(() => Math.min(6, Math.max(2, Math.round(props.config.pageCount / 10))))
function stackShadow(direction: -1 | 1) {
  const layers: string[] = []
  for (let i = 1; i <= stackLayers.value; i++) {
    layers.push(`${direction * i}px ${i}px 0 ${i % 2 ? '#e6dfd4' : '#f8f5ef'}`)
  }
  return layers.join(', ')
}

const style = computed(() => ({
  '--sr': (format.value.widthCm * 2) / format.value.heightCm,
  '--fit-w': `${props.fit[0] * 100}cqw`,
  '--fit-h': `${props.fit[1] * 100}cqh`,
}))

/* ---------- Page turn ---------- */

interface Flip {
  from: string
  to: string
  dir: 'next' | 'prev'
}

const flip = ref<Flip | null>(null)
const { fullMotion } = useMotionLevel()
let flipTimer: ReturnType<typeof setTimeout> | undefined

const order = computed(() => [ENDPAPER_ID, ...props.config.spreads.map((s) => s.id)])

watch(
  () => props.spreadId,
  (to, from) => {
    clearTimeout(flipTimer)
    flip.value = null
    if (!from || !fullMotion.value) return
    const a = order.value.indexOf(from)
    const b = order.value.indexOf(to)
    if (a < 0 || b < 0 || a === b) return
    // Next tick: the cleared flip renders first, so a rapid second click restarts the animation.
    nextTick(() => {
      flip.value = { from, to, dir: b > a ? 'next' : 'prev' }
      flipTimer = setTimeout(() => (flip.value = null), 720)
    })
  },
)

onBeforeUnmount(() => clearTimeout(flipTimer))

const leftId = computed(() => (flip.value ? (flip.value.dir === 'next' ? flip.value.from : flip.value.to) : props.spreadId))
const rightId = computed(() => (flip.value ? (flip.value.dir === 'next' ? flip.value.to : flip.value.from) : props.spreadId))
</script>

<template>
  <div class="spread-scene">
    <div class="open-book" :style="style">
      <span class="floor-shadow" aria-hidden="true" />

      <!-- Cover boards peeking out around the page block -->
      <div class="board" aria-hidden="true">
        <MaterialSurface :surface="cover.surface === 'print' ? 'matte' : cover.surface" :color="boardColor" />
      </div>

      <div class="pages">
        <span class="stack stack-left" :style="{ boxShadow: stackShadow(-1) }" aria-hidden="true" />
        <span class="stack stack-right" :style="{ boxShadow: stackShadow(1) }" aria-hidden="true" />

        <SpreadHalf
          :config="config"
          :spread-id="leftId"
          side="left"
          :interactive="interactive && !flip"
          :sizes="sizes"
          @replace="emit('replace', leftId, $event)"
        />
        <SpreadHalf
          :config="config"
          :spread-id="rightId"
          side="right"
          :interactive="interactive && !flip"
          :sizes="sizes"
          @replace="emit('replace', rightId, $event)"
        />

        <span class="gutter" aria-hidden="true" />

        <!-- Extra layers aligned with the page block (e.g. the hero's opening cover). -->
        <slot name="overlay" />

        <div v-if="flip" :key="`${flip.from}>${flip.to}`" class="leaf" :class="`leaf-${flip.dir}`" aria-hidden="true">
          <div class="leaf-face leaf-front">
            <div class="leaf-content" :class="flip.dir === 'next' ? 'shift' : ''">
              <SpreadHalf :config="config" :spread-id="flip.from" :side="flip.dir === 'next' ? 'right' : 'left'" :sizes="sizes" />
            </div>
          </div>
          <div class="leaf-face leaf-back">
            <div class="leaf-content" :class="flip.dir === 'prev' ? 'shift' : ''">
              <SpreadHalf :config="config" :spread-id="flip.to" :side="flip.dir === 'next' ? 'left' : 'right'" :sizes="sizes" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spread-scene {
  container-type: size;
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.open-book {
  --w: min(var(--fit-w), calc(var(--fit-h) * var(--sr)));
  position: relative;
  width: var(--w);
  aspect-ratio: var(--sr);
  perspective: 2400px;
  transition: width var(--motion-slow) var(--ease-enter);
}

.floor-shadow {
  position: absolute;
  inset: 4% -3% -7% -3%;
  background: radial-gradient(50% 50% at 50% 55%, rgb(41 39 36 / 0.28), transparent);
  pointer-events: none;
}

.board {
  position: absolute;
  inset: -2.4% -1.6%;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 18px 40px -22px rgb(41 39 36 / 0.55);
}

.pages {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.stack {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  border-radius: 2px;
  background: #f8f5ef;
}

.stack-left {
  left: 0;
}

.stack-right {
  right: 0;
}

/* Layflat gutter: a soft fold, plus gentle page curvature towards the spine. */
.gutter {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(0 0 0 / 0.05) 0%,
    transparent 6%,
    transparent 44%,
    rgb(0 0 0 / 0.07) 48.6%,
    rgb(0 0 0 / 0.2) 50%,
    rgb(255 255 255 / 0.1) 50.3%,
    rgb(0 0 0 / 0.06) 51.6%,
    transparent 56%,
    transparent 94%,
    rgb(0 0 0 / 0.05) 100%
  );
}

/* ---------- Turning leaf ---------- */

.leaf {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  transform-style: preserve-3d;
  will-change: transform;
}

.leaf-next {
  left: 50%;
  transform-origin: left center;
  animation: turn-next 700ms var(--ease-standard) both;
}

.leaf-prev {
  left: 0;
  transform-origin: right center;
  animation: turn-prev 700ms var(--ease-standard) both;
}

.leaf-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
}

.leaf-back {
  transform: rotateY(180deg);
}

.leaf-content {
  position: absolute;
  inset: 0 auto 0 0;
  width: 200%;
}

.leaf-content.shift {
  left: -100%;
}

/* Shade on the leaf while it is upright. */
.leaf-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.22), transparent 60%);
  opacity: 0;
  animation: leaf-shade 700ms var(--ease-standard) both;
}

.leaf-prev .leaf-face::after {
  background: linear-gradient(270deg, rgb(0 0 0 / 0.22), transparent 60%);
}

@keyframes turn-next {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(-180deg);
  }
}

@keyframes turn-prev {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(180deg);
  }
}

@keyframes leaf-shade {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
