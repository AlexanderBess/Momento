<script setup lang="ts">
import { findCoverColor, findCoverType, findTitleColor } from '~/config/photobook/covers'
import { bookThicknessMm, findFormat } from '~/config/photobook/formats'
import { effectiveExtras } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

/**
 * Closed photobook as a light CSS 3D object: front board, spine, page block edge and back board.
 *
 * Size is pure CSS (container query units): the book fits its parent for any format, and the spine
 * thickness follows the page count — no JS measuring, identical on server and client.
 * Optional pointer tilt (desktop, full motion only) and two poses: three-quarter and spine.
 */
type CoverConfig = Pick<
  PhotobookConfig,
  | 'format'
  | 'pageCount'
  | 'coverType'
  | 'coverColor'
  | 'coverTitle'
  | 'coverTitleEnabled'
  | 'coverTitleColor'
  | 'coverTitlePosition'
  | 'coverImageId'
  | 'spineColor'
  | 'extras'
>

const props = withDefaults(
  defineProps<{
    config: CoverConfig
    pose?: 'three-quarter' | 'spine' | 'front'
    /** Follow the pointer a little (desktop only). */
    tilt?: boolean
    /** Fraction of the container the book may take: width / height. */
    fit?: [number, number]
    sizes?: string
    /** Flat colour fill instead of a simulated material texture (light falloff only). */
    plain?: boolean
  }>(),
  { pose: 'three-quarter', tilt: false, fit: () => [0.62, 0.8], sizes: '260px', plain: false },
)

const format = computed(() => findFormat(props.config.format))
const type = computed(() => findCoverType(props.config.coverType))
const color = computed(() => findCoverColor(props.config.coverType, props.config.coverColor))
const spine = computed(() =>
  props.config.spineColor === 'match' ? color.value : findCoverColor(props.config.coverType, props.config.spineColor),
)
const title = computed(() => findTitleColor(props.config.coverType, props.config.coverTitleColor))
const showTitle = computed(() => props.config.coverTitleEnabled && props.config.coverTitle.trim().length > 0)
const extras = computed(() => effectiveExtras(props.config))

const poses = { 'three-quarter': [-9, 26], spine: [-6, 64], front: [0, 0] } as const

const bookStyle = computed(() => {
  const [rx, ry] = poses[props.pose]
  return {
    '--ratio': format.value.widthCm / format.value.heightCm,
    '--tk': bookThicknessMm(props.config.pageCount) / (format.value.widthCm * 10),
    '--fit-w': `${props.fit[0] * 100}cqw`,
    '--fit-h': `${props.fit[1] * 100}cqh`,
    '--rx': `${rx}deg`,
    '--ry': `${ry}deg`,
  }
})

/** Title paint: metallic foil, blind deboss in the material's tone, or flat print. */
const titleStyle = computed(() => {
  const t = title.value
  if (t.finish === 'foil') {
    return {
      backgroundImage: `linear-gradient(160deg, ${t.hex} 0%, ${t.hexTo} 45%, ${t.hex} 70%, ${t.hexTo} 100%)`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      filter: 'drop-shadow(0 1px 0 rgb(0 0 0 / 0.25))',
    }
  }
  if (t.finish === 'deboss') {
    const light = color.value.ink === 'dark'
    return {
      color: `color-mix(in oklab, ${color.value.hex} ${light ? 78 : 70}%, ${light ? '#000' : '#000'})`,
      textShadow: light ? '0 1px 0 rgb(255 255 255 / 0.45)' : '0 1px 0 rgb(255 255 255 / 0.12)',
    }
  }
  return { color: t.hex }
})

/* ---------- Pointer tilt ---------- */

const scene = useTemplateRef<HTMLElement>('scene')
const { fullMotion } = useMotionLevel()
let canTilt = false
let frame = 0

onMounted(() => {
  canTilt = props.tilt && fullMotion.value && window.matchMedia('(hover: hover) and (pointer: fine)').matches
})

function onPointerMove(event: PointerEvent) {
  if (!canTilt || !scene.value) return
  const rect = scene.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
  if (frame) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    scene.value?.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`)
    scene.value?.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`)
  })
}

function onPointerLeave() {
  if (frame) cancelAnimationFrame(frame)
  scene.value?.style.setProperty('--tilt-x', '0deg')
  scene.value?.style.setProperty('--tilt-y', '0deg')
}

onBeforeUnmount(() => frame && cancelAnimationFrame(frame))
</script>

<template>
  <div ref="scene" class="cover-scene" @pointermove.passive="onPointerMove" @pointerleave="onPointerLeave">
    <div class="book" :style="bookStyle">
      <span class="floor-shadow" aria-hidden="true" />

      <!-- Back board -->
      <div class="face back">
        <MaterialSurface :surface="plain ? 'plain' : type.surface === 'print' ? 'linen' : type.surface" :color="type.usesPhoto ? spine.hex : color.hex" />
      </div>

      <!-- Page block: top edge and fore-edge -->
      <div class="face top" aria-hidden="true" />
      <div class="face fore" aria-hidden="true" />

      <!-- Spine -->
      <div class="face spine">
        <MaterialSurface :surface="plain ? 'plain' : type.surface === 'print' ? 'matte' : type.surface" :color="spine.hex" />
        <span class="spine-shade" aria-hidden="true" />
        <span v-if="extras.spineText" class="spine-text font-display" :style="titleStyle">
          {{ config.coverTitle }}
        </span>
      </div>

      <!-- Front board -->
      <div class="face front">
        <template v-if="type.usesPhoto">
          <PhotobookImage :image-id="config.coverImageId" :sizes="sizes" eager />
          <span class="laminate" aria-hidden="true" />
          <span v-if="showTitle" class="scrim" :class="`at-${config.coverTitlePosition}`" aria-hidden="true" />
        </template>
        <MaterialSurface v-else :surface="plain ? 'plain' : type.surface" :color="color.hex" lit />

        <span v-if="extras.embossing" class="emboss-frame" aria-hidden="true" />
        <span class="hinge" aria-hidden="true" />

        <div class="title-area" :class="`at-${config.coverTitlePosition}`">
          <Transition name="title-fade" mode="out-in">
            <p v-if="showTitle" class="title font-display" :style="titleStyle">
              {{ config.coverTitle }}
            </p>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover-scene {
  container-type: size;
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  perspective: 1800px;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
}

.book {
  --w: min(var(--fit-w), calc(var(--fit-h) * var(--ratio)));
  --h: calc(var(--w) / var(--ratio));
  --t: max(8px, calc(var(--w) * var(--tk)));
  position: relative;
  width: var(--w);
  height: var(--h);
  transform-style: preserve-3d;
  transform: rotateX(calc(var(--rx) + var(--tilt-x))) rotateY(calc(var(--ry) + var(--tilt-y)));
  transition:
    transform 700ms var(--ease-enter),
    width var(--motion-slow) var(--ease-enter),
    height var(--motion-slow) var(--ease-enter);
}

.face {
  position: absolute;
  overflow: hidden;
  backface-visibility: hidden;
}

.front,
.back {
  inset: 0;
  border-radius: 2px 5px 5px 2px;
}

.front {
  transform: translateZ(calc(var(--t) / 2));
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.05);
}

.back {
  transform: rotateY(180deg) translateZ(calc(var(--t) / 2));
}

.spine {
  top: 0;
  left: calc(50% - var(--t) / 2);
  width: var(--t);
  height: 100%;
  transform: rotateY(-90deg) translateZ(calc(var(--w) / 2));
  border-radius: 3px;
  transition:
    width var(--motion-slow) var(--ease-enter),
    left var(--motion-slow) var(--ease-enter);
}

.spine-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgb(0 0 0 / 0.28),
    rgb(0 0 0 / 0.06) 22%,
    rgb(255 255 255 / 0.1) 50%,
    rgb(0 0 0 / 0.06) 78%,
    rgb(0 0 0 / 0.3)
  );
}

.spine-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  font-size: min(calc(var(--t) * 0.5), calc(var(--w) * 0.045));
  white-space: nowrap;
  overflow: hidden;
  letter-spacing: 0.06em;
}

.top {
  left: 0;
  top: calc(50% - var(--t) / 2);
  width: calc(100% - 3px);
  height: var(--t);
  transform: rotateX(90deg) translateZ(calc(var(--h) / 2 - 1px));
  background:
    linear-gradient(180deg, rgb(0 0 0 / 0.08), transparent 18%, transparent 82%, rgb(0 0 0 / 0.08)),
    repeating-linear-gradient(180deg, #f7f3ec 0 1px, #e4ddd2 1px 2px);
  transition:
    height var(--motion-slow) var(--ease-enter),
    top var(--motion-slow) var(--ease-enter);
}

.fore {
  top: 1%;
  left: calc(50% - var(--t) / 2);
  width: var(--t);
  height: 98%;
  transform: rotateY(90deg) translateZ(calc(var(--w) / 2 - 3px));
  background: repeating-linear-gradient(90deg, #f7f3ec 0 1px, #e2dbd0 1px 2px);
  transition:
    width var(--motion-slow) var(--ease-enter),
    left var(--motion-slow) var(--ease-enter);
}

.floor-shadow {
  position: absolute;
  left: 2%;
  right: -6%;
  bottom: -9%;
  height: 16%;
  transform: translateZ(calc(var(--t) / -2 - 1px));
  background: radial-gradient(closest-side, rgb(41 39 36 / 0.32), transparent);
  pointer-events: none;
}

/* Board hinge: the pressed groove next to the spine. */
.hinge {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 5.5%;
  width: 2px;
  background: linear-gradient(90deg, rgb(0 0 0 / 0.16), rgb(255 255 255 / 0.18));
  pointer-events: none;
}

.emboss-frame {
  position: absolute;
  inset: 7% 7% 7% 10%;
  border-radius: 2px;
  box-shadow:
    inset 0 1px 1px rgb(0 0 0 / 0.22),
    0 1px 0 rgb(255 255 255 / 0.28),
    inset 0 0 0 1px rgb(0 0 0 / 0.08);
  pointer-events: none;
}

.laminate {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgb(255 255 255 / 0.18), transparent 30%, transparent 70%, rgb(0 0 0 / 0.12));
  pointer-events: none;
}

.scrim {
  position: absolute;
  inset-inline: 0;
  height: 40%;
  pointer-events: none;
}

.scrim.at-top {
  top: 0;
  background: linear-gradient(180deg, rgb(0 0 0 / 0.28), transparent);
}

.scrim.at-center {
  top: 30%;
  background: radial-gradient(closest-side, rgb(0 0 0 / 0.22), transparent);
}

.scrim.at-bottom {
  bottom: 0;
  background: linear-gradient(0deg, rgb(0 0 0 / 0.3), transparent);
}

.title-area {
  position: absolute;
  inset: 0 0 0 5.5%;
  display: flex;
  justify-content: center;
  padding: 13% 11%;
  text-align: center;
}

.title-area.at-top {
  align-items: flex-start;
}

.title-area.at-center {
  align-items: center;
}

.title-area.at-bottom {
  align-items: flex-end;
}

.title {
  font-size: min(calc(var(--w) * 0.085), calc(var(--h) * 0.085));
  line-height: 1.05;
  letter-spacing: 0.01em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.title-fade-enter-active,
.title-fade-leave-active {
  transition:
    opacity var(--motion-normal) var(--ease-standard),
    transform var(--motion-normal) var(--ease-standard);
}

.title-fade-enter-from,
.title-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
