<script setup lang="ts">
import type { PhotozoneVisualAsset } from '~/config/photozones'

/**
 * Image slot of the photo zones page.
 *
 * With a real photo (`image.src`) — a responsive image with reserved space.
 * Without one — a schematic sketch of the concept (arch / circle / panels / balloons / frame) in the
 * page palette, explicitly labelled «Концепция · фото будет добавлено». It reads as an illustration,
 * never as a photo of a finished MOMENTO project. Same pattern as PhotographyFrame / DemoArtwork.
 */
const props = withDefaults(
  defineProps<{
    asset: PhotozoneVisualAsset
    /** CSS aspect-ratio; "fill" stretches to the parent (the parent reserves the space). */
    ratio?: string
    sizes?: string
    priority?: boolean
    zoomOnHover?: boolean
    /** Show the «Концепция» label over the sketch. */
    label?: boolean
    rounded?: boolean
  }>(),
  { ratio: undefined, sizes: '640px', priority: false, zoomOnHover: false, label: true, rounded: true },
)

const uid = useId()
const isFill = computed(() => props.ratio === 'fill')
const aspectRatio = computed(() =>
  isFill.value ? undefined : (props.ratio ?? `${props.asset.image.width} / ${props.asset.image.height}`),
)

const sketch = computed(() => props.asset.sketch)
const wall = computed(() => sketch.value.palette[0])
const body = computed(() => sketch.value.palette[1])
const accent = computed(() => sketch.value.palette[2])

/* Floral clusters: overlapping blooms + a few leaves. Deterministic, so SSR and client match. */
interface Blot {
  cx: number
  cy: number
  r: number
  kind: 'bloom' | 'bud' | 'leaf'
  rot?: number
}

function cluster(x: number, y: number, scale = 1): Blot[] {
  const s = scale
  return [
    { cx: x - 30 * s, cy: y - 4 * s, r: 16 * s, kind: 'leaf', rot: -35 },
    { cx: x + 30 * s, cy: y - 10 * s, r: 15 * s, kind: 'leaf', rot: 30 },
    { cx: x, cy: y - 26 * s, r: 14 * s, kind: 'leaf', rot: 80 },
    { cx: x - 12 * s, cy: y, r: 20 * s, kind: 'bloom' },
    { cx: x + 14 * s, cy: y - 6 * s, r: 16 * s, kind: 'bloom' },
    { cx: x + 2 * s, cy: y - 18 * s, r: 12 * s, kind: 'bud' },
    { cx: x - 26 * s, cy: y + 8 * s, r: 9 * s, kind: 'bud' },
    { cx: x + 28 * s, cy: y + 6 * s, r: 10 * s, kind: 'bud' },
  ]
}

const florals = computed<Blot[]>(() => {
  const where = sketch.value.florals ?? 'none'
  const top: Record<PhotozoneVisualAsset['sketch']['shape'], [number, number]> = {
    arch: [236, 176],
    circle: [208, 196],
    panels: [282, 156],
    cloud: [214, 170],
    frame: [226, 140],
  }
  const base = [...cluster(222, 404, 1.15), ...cluster(384, 408, 0.9)]
  const [tx, ty] = top[sketch.value.shape]
  const corner = cluster(tx, ty, 1)
  if (where === 'base') return base
  if (where === 'corner') return corner
  if (where === 'both') return [...base, ...corner]
  return []
})

/* Balloon garland for the «cloud» shape. */
const balloons = [
  [196, 392, 30],
  [222, 352, 24],
  [208, 312, 20],
  [232, 274, 26],
  [222, 230, 18],
  [250, 196, 24],
  [288, 170, 20],
  [326, 156, 26],
  [364, 166, 18],
  [392, 196, 24],
  [404, 236, 16],
  [246, 236, 12],
  [262, 160, 12],
  [410, 384, 22],
  [386, 404, 16],
] as const
</script>

<template>
  <div
    class="relative overflow-hidden"
    :class="[rounded && 'rounded-card', isFill && 'size-full']"
    :style="{ aspectRatio, backgroundColor: wall }"
  >
    <NuxtImg
      v-if="asset.image.src"
      :src="asset.image.src"
      :alt="asset.image.alt"
      :width="asset.image.width"
      :height="asset.image.height"
      :sizes="sizes"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      :preload="priority ? { fetchPriority: 'high' } : false"
      decoding="async"
      class="size-full object-cover"
      :class="zoomOnHover && 'transition-transform duration-[900ms] ease-enter will-change-transform group-hover:scale-[1.035]'"
    />

    <div
      v-else
      role="img"
      :aria-label="`Схематичная иллюстрация концепции, фото будет добавлено: ${asset.image.alt}`"
      class="@container absolute inset-0"
    >
      <svg
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid slice"
        class="size-full"
        :class="zoomOnHover && 'transition-transform duration-[900ms] ease-enter group-hover:scale-[1.035]'"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="`${uid}-wall`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.25" />
            <stop offset="0.8" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <radialGradient :id="`${uid}-light`" cx="0.3" cy="0.15" r="0.7">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.3" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Wall, daylight, floor -->
        <rect width="600" height="500" :fill="`url(#${uid}-wall)`" />
        <rect width="600" height="500" :fill="`url(#${uid}-light)`" />
        <rect y="412" width="600" height="88" fill="#292724" fill-opacity="0.045" />
        <line x1="0" y1="412" x2="600" y2="412" stroke="#292724" stroke-opacity="0.08" />
        <ellipse cx="300" cy="414" rx="150" ry="9" fill="#292724" fill-opacity="0.08" />

        <!-- Structure -->
        <g v-if="sketch.shape === 'arch'">
          <path d="M196 412 V196 A104 104 0 0 1 404 196 V412 Z" :fill="accent" fill-opacity="0.22" />
          <path d="M214 412 V204 A86 86 0 0 1 386 204 V412 Z" :fill="body" />
          <path d="M214 412 V204 A86 86 0 0 1 386 204 V412" fill="none" stroke="#292724" stroke-opacity="0.07" />
        </g>

        <g v-else-if="sketch.shape === 'circle'">
          <circle cx="300" cy="262" r="132" :fill="accent" fill-opacity="0.2" />
          <circle cx="300" cy="256" r="118" :fill="body" />
          <rect x="234" y="356" width="56" height="56" rx="4" :fill="body" stroke="#292724" stroke-opacity="0.08" />
          <rect x="290" y="378" width="62" height="34" rx="4" :fill="wall" stroke="#292724" stroke-opacity="0.1" />
          <rect x="352" y="366" width="40" height="46" rx="4" :fill="body" stroke="#292724" stroke-opacity="0.08" />
        </g>

        <g v-else-if="sketch.shape === 'panels'">
          <path d="M186 412 V236 A38 38 0 0 1 262 236 V412 Z" :fill="accent" fill-opacity="0.28" />
          <path d="M256 412 V166 A46 46 0 0 1 348 166 V412 Z" :fill="body" />
          <path d="M342 412 V256 A34 34 0 0 1 410 256 V412 Z" :fill="accent" fill-opacity="0.18" />
          <path d="M256 412 V166 A46 46 0 0 1 348 166 V412" fill="none" stroke="#292724" stroke-opacity="0.07" />
          <rect x="236" y="396" width="132" height="16" :fill="wall" stroke="#292724" stroke-opacity="0.08" />
        </g>

        <g v-else-if="sketch.shape === 'cloud'">
          <rect x="212" y="148" width="176" height="264" rx="88" :fill="body" />
          <circle
            v-for="([cx, cy, r], i) in balloons"
            :key="i"
            :cx="cx"
            :cy="cy"
            :r="r"
            :fill="i % 3 === 0 ? accent : i % 3 === 1 ? '#ffffff' : accent"
            :fill-opacity="i % 3 === 0 ? 0.75 : i % 3 === 1 ? 0.85 : 0.4"
          />
        </g>

        <g v-else-if="sketch.shape === 'frame'">
          <rect x="206" y="122" width="188" height="290" rx="2" :fill="accent" fill-opacity="0.2" />
          <rect x="218" y="134" width="164" height="278" :fill="body" />
          <rect x="218" y="134" width="164" height="278" fill="none" :stroke="accent" stroke-opacity="0.55" stroke-width="3" />
          <rect x="250" y="396" width="100" height="16" :fill="wall" stroke="#292724" stroke-opacity="0.08" />
        </g>

        <!-- Neon-like script line -->
        <g v-if="sketch.neon" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M252 268 c8 -26 26 -26 22 0 c-3 18 -14 22 -8 6 c8 -20 26 -20 26 2 c0 14 10 14 18 -2 c8 -16 22 -14 20 4 c-1 12 10 14 20 -4"
            stroke="#ffffff"
            stroke-opacity="0.5"
            stroke-width="9"
          />
          <path
            d="M252 268 c8 -26 26 -26 22 0 c-3 18 -14 22 -8 6 c8 -20 26 -20 26 2 c0 14 10 14 18 -2 c8 -16 22 -14 20 4 c-1 12 10 14 20 -4"
            stroke="#747b62"
            stroke-width="2.5"
          />
        </g>

        <!-- Florals -->
        <g v-for="(blot, i) in florals" :key="`f${i}`">
          <ellipse
            v-if="blot.kind === 'leaf'"
            :cx="blot.cx"
            :cy="blot.cy"
            :rx="blot.r"
            :ry="blot.r * 0.42"
            :transform="`rotate(${blot.rot} ${blot.cx} ${blot.cy})`"
            fill="#747b62"
            fill-opacity="0.55"
          />
          <circle
            v-else
            :cx="blot.cx"
            :cy="blot.cy"
            :r="blot.r"
            :fill="blot.kind === 'bloom' ? '#ffffff' : accent"
            :fill-opacity="blot.kind === 'bloom' ? 0.92 : 0.85"
          />
          <circle v-if="blot.kind === 'bloom'" :cx="blot.cx" :cy="blot.cy" :r="blot.r * 0.55" :fill="accent" fill-opacity="0.22" />
        </g>
      </svg>

      <!-- Hairline edge: keeps a pale sketch distinct from an equally pale section background. -->
      <span class="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-text/8 ring-inset" aria-hidden="true" />

      <span
        v-if="label"
        class="absolute bottom-4 left-4 hidden rounded-full bg-[rgb(247_246_241/0.85)] px-3 py-1.5 text-[0.625rem] font-semibold tracking-[0.16em] text-muted uppercase backdrop-blur-sm @[14rem]:inline-flex"
        aria-hidden="true"
      >
        Концепция · фото будет добавлено
      </span>
      <span
        v-if="label"
        class="absolute bottom-3 left-3 inline-flex rounded-full bg-[rgb(247_246_241/0.85)] px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.14em] text-muted uppercase @[14rem]:hidden"
        aria-hidden="true"
      >
        Концепция
      </span>
    </div>
  </div>
</template>
