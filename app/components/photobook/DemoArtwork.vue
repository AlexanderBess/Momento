<script setup lang="ts">
import type { DemoArt } from '~/types/photobook'

/**
 * Procedural demo illustration for the photobook library (used while `LibraryImage.src` is null).
 *
 * Flat, muted vector scenes in the spirit of minimalist art prints: they show composition and colour
 * of a spread without pretending to be real photos. Deterministic — the same `art` always renders
 * the same picture. The canvas is square and cropped with `slice`, so every scene keeps its subject
 * in the central band and survives any slot shape.
 */
const props = defineProps<{ art: DemoArt }>()

const uid = useId()
const id = (name: string) => `${uid}-${name}`

const c = computed(() => props.art.palette)
const v = computed(() => props.art.variant ?? 0)

/** Small seeded PRNG so "random" details are stable between renders and between SSR and client. */
function random(seed: number) {
  let t = seed + 0x6d2b79f5
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function wave(base: number, amp: number, period: number, phase: number, sharp = false) {
  const points: string[] = []
  for (let x = -10; x <= 410; x += sharp ? 50 : 20) {
    const y = sharp
      ? base - amp * Math.abs(Math.sin(x / period + phase)) * (0.6 + 0.4 * Math.cos(x / 37 + phase))
      : base + amp * Math.sin(x / period + phase)
    points.push(`${x},${y.toFixed(1)}`)
  }
  return `M-10,410 L${points.join(' L')} L410,410 Z`
}

/** Head + shoulders silhouette (x — centre, y — head centre, s — scale). */
function figure(x: number, y: number, s: number) {
  const head = 24 * s
  const neck = y + head * 0.95
  const shoulder = 52 * s
  return {
    head: { cx: x, cy: y, r: head },
    body: `M${x - shoulder},410 C${x - shoulder},${neck + 70 * s} ${x - shoulder * 0.95},${neck + 14 * s} ${x - 12 * s},${neck}
           L${x + 12 * s},${neck} C${x + shoulder * 0.95},${neck + 14 * s} ${x + shoulder},${neck + 70 * s} ${x + shoulder},410 Z`,
  }
}

const hills = computed(() => {
  const sharp = v.value === 2
  const phase = v.value * 1.3
  return [
    { d: wave(sharp ? 250 : 238, sharp ? 90 : 18, 60, phase, sharp), fill: c.value[1], opacity: 0.9 },
    { d: wave(272, sharp ? 60 : 24, 75, phase + 2, sharp), fill: c.value[2], opacity: 0.75 },
    { d: wave(312, 22, 90, phase + 4), fill: c.value[2], opacity: 1 },
    { d: wave(356, 16, 110, phase + 1), fill: c.value[3], opacity: 0.9 },
  ]
})

const city = computed(() => {
  const rnd = random(11 + v.value * 7)
  const back: { x: number; y: number; w: number }[] = []
  const front: { x: number; y: number; w: number; windows: { x: number; y: number }[] }[] = []
  for (let x = -10; x < 410; ) {
    const w = 26 + rnd() * 34
    back.push({ x, y: 170 + rnd() * 70, w })
    x += w + 2
  }
  for (let x = -6; x < 410; ) {
    const w = 30 + rnd() * 40
    const y = 220 + rnd() * 80
    const windows: { x: number; y: number }[] = []
    for (let wy = y + 12; wy < 330; wy += 16)
      for (let wx = x + 7; wx < x + w - 8; wx += 12) if (rnd() > 0.45) windows.push({ x: wx, y: wy })
    front.push({ x, y, w, windows })
    x += w + 3
  }
  return { back, front, night: v.value === 2, water: v.value === 3 }
})

const forest = computed(() => {
  const rnd = random(5 + v.value * 13)
  return Array.from({ length: 14 }, (_, i) => {
    const depth = i % 3
    return {
      x: rnd() * 400,
      w: depth === 0 ? 6 + rnd() * 6 : depth === 1 ? 12 + rnd() * 10 : 22 + rnd() * 16,
      fill: depth === 2 ? c.value[3] : c.value[2],
      opacity: depth === 0 ? 0.35 : depth === 1 ? 0.6 : 0.95,
    }
  }).sort((a, b) => a.opacity - b.opacity)
})

const balloons = computed(() => {
  const rnd = random(3 + v.value * 17)
  const colors = [c.value[2], c.value[4], c.value[1], c.value[3], c.value[2]]
  return colors.map((fill, i) => ({
    cx: 110 + i * 46 + (rnd() - 0.5) * 30,
    cy: 120 + rnd() * 70,
    fill,
  }))
})

const bouquet = computed(() => {
  const rnd = random(21 + v.value * 5)
  const cx = 200 + (v.value - 1) * 14
  return {
    cx,
    flowers: Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + rnd()
      const dist = i === 0 ? 0 : 30 + rnd() * 30
      return {
        cx: cx + Math.cos(angle) * dist,
        cy: 170 + Math.sin(angle) * dist * 0.8,
        r: 18 + rnd() * 14,
        fill: [c.value[4], c.value[1], c.value[2]][i % 3]!,
      }
    }),
    leaves: Array.from({ length: 6 }, (_, i) => ({
      cx: cx + (i % 2 ? 1 : -1) * (50 + rnd() * 30),
      cy: 190 + rnd() * 60,
      rot: (i % 2 ? 1 : -1) * (30 + rnd() * 30),
    })),
  }
})

const family = computed(() => {
  const sets = [
    [
      [150, 1.15],
      [212, 1.05],
      [262, 0.7],
      [118, 0.6],
    ],
    [
      [140, 1.1],
      [200, 1.1],
      [260, 1.05],
    ],
    [
      [130, 1.05],
      [190, 1.1],
      [250, 1],
      [305, 1.05],
    ],
    [
      [150, 0.7],
      [230, 0.65],
      [300, 0.6],
    ],
  ] as const
  return (sets[v.value] ?? sets[0]).map(([x, s]) => figure(x, 300 - 110 * s, s))
})
</script>

<template>
  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" class="size-full" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="id('sky')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="c[4]" />
        <stop offset="1" :stop-color="c[1]" />
      </linearGradient>
      <linearGradient :id="id('bg')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="c[0]" />
        <stop offset="1" :stop-color="c[1]" />
      </linearGradient>
      <linearGradient :id="id('deep')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="c[2]" />
        <stop offset="1" :stop-color="c[3]" />
      </linearGradient>
      <linearGradient :id="id('figure')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="c[3]" stop-opacity="0.82" />
        <stop offset="1" :stop-color="c[3]" />
      </linearGradient>
      <radialGradient :id="id('glow')" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" :stop-color="c[4]" stop-opacity="0.95" />
        <stop offset="1" :stop-color="c[4]" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- ---------- Sea / lake horizon ---------- -->
    <g v-if="art.scene === 'horizon'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <circle :cx="[200, 150, 250, 200][v]" cy="205" r="80" :fill="`url(#${id('glow')})`" />
      <circle :cx="[200, 150, 250, 200][v]" cy="210" r="30" :fill="c[4]" />
      <path v-if="v === 2" :d="wave(232, 26, 70, 1.4)" :fill="c[2]" opacity="0.7" />
      <rect y="232" width="400" height="178" :fill="`url(#${id('deep')})`" />
      <g :fill="c[4]" opacity="0.55">
        <rect v-for="i in 6" :key="i" :x="[200, 150, 250, 200][v]! - 40 + i * 4" :y="240 + i * 14" :width="80 - i * 8" height="2.5" rx="1.25" />
      </g>
    </g>

    <!-- ---------- Layered hills / mountains ---------- -->
    <g v-else-if="art.scene === 'hills'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <circle :cx="v === 1 ? 110 : 285" cy="150" r="70" :fill="`url(#${id('glow')})`" />
      <circle :cx="v === 1 ? 110 : 285" cy="150" r="20" :fill="c[4]" />
      <path v-for="(hill, i) in hills" :key="i" :d="hill.d" :fill="hill.fill" :opacity="hill.opacity" />
    </g>

    <!-- ---------- Architecture: arch ---------- -->
    <g v-else-if="art.scene === 'arch'">
      <rect width="400" height="400" :fill="`url(#${id('bg')})`" />
      <path
        :d="`M${v === 1 ? 140 : 125},400 V200 A${v === 1 ? 60 : 75},${v === 1 ? 60 : 75} 0 0 1 ${v === 1 ? 260 : 275},200 V400 Z`"
        :fill="`url(#${id('sky')})`"
      />
      <path v-if="v !== 1" :d="wave(330, 10, 50, v)" :fill="c[2]" opacity="0.8" />
      <circle v-if="v === 2" cx="200" cy="230" r="24" :fill="c[4]" />
      <path
        :d="`M${v === 1 ? 140 : 125},400 V200 A${v === 1 ? 60 : 75},${v === 1 ? 60 : 75} 0 0 1 ${v === 1 ? 260 : 275},200 V400`"
        fill="none"
        :stroke="c[3]"
        stroke-opacity="0.35"
        stroke-width="10"
      />
      <polygon points="125,400 275,400 330,330 180,330" :fill="c[4]" opacity="0.35" />
      <rect y="378" width="400" height="22" :fill="c[2]" opacity="0.6" />
    </g>

    <!-- ---------- City skyline ---------- -->
    <g v-else-if="art.scene === 'city'">
      <rect width="400" height="400" :fill="city.night ? c[3] : `url(#${id('sky')})`" />
      <circle cx="300" cy="120" r="22" :fill="c[4]" :opacity="city.night ? 0.9 : 0.8" />
      <rect v-for="(b, i) in city.back" :key="`b${i}`" :x="b.x" :y="b.y" :width="b.w" height="300" :fill="c[2]" opacity="0.55" />
      <g v-for="(b, i) in city.front" :key="`f${i}`">
        <rect :x="b.x" :y="b.y" :width="b.w" height="300" :fill="city.night ? '#00000055' : c[3]" :opacity="city.night ? 1 : 0.85" />
        <rect v-for="(w, j) in b.windows" :key="j" :x="w.x" :y="w.y" width="5" height="7" :fill="c[4]" :opacity="city.night ? 0.85 : 0.4" />
      </g>
      <rect v-if="city.water" y="320" width="400" height="90" :fill="`url(#${id('deep')})`" />
      <rect v-else y="330" width="400" height="80" :fill="c[3]" />
    </g>

    <!-- ---------- Couple ---------- -->
    <g v-else-if="art.scene === 'couple'">
      <rect width="400" height="400" :fill="v === 3 || v === 1 ? `url(#${id('sky')})` : `url(#${id('bg')})`" />
      <circle cx="300" cy="120" r="90" :fill="`url(#${id('glow')})`" />
      <g :fill="c[4]" opacity="0.5">
        <circle cx="80" cy="90" r="16" />
        <circle cx="120" cy="140" r="8" />
        <circle cx="330" cy="230" r="12" />
        <circle cx="60" cy="210" r="10" />
      </g>
      <path v-if="v === 3" :d="wave(330, 12, 80, 0.6)" :fill="c[2]" />
      <template v-for="(f, i) in [figure(v === 2 ? 178 : 168, v === 1 ? 175 : 170, 1.15), figure(v === 2 ? 222 : 236, 190, 1.02)]" :key="i">
        <path :d="f.body" :fill="`url(#${id('figure')})`" :opacity="i ? 0.88 : 1" />
        <circle v-bind="f.head" :fill="c[3]" :opacity="i ? 0.88 : 1" />
      </template>
    </g>

    <!-- ---------- Single portrait ---------- -->
    <g v-else-if="art.scene === 'portrait'">
      <rect width="400" height="400" :fill="`url(#${id('bg')})`" />
      <polygon :points="v % 2 ? '0,0 150,0 330,400 120,400' : '250,0 400,0 400,400 120,400'" :fill="c[4]" opacity="0.45" />
      <path v-if="v === 2" :d="wave(300, 14, 70, 2)" :fill="c[2]" opacity="0.8" />
      <template v-for="(f, i) in [figure(v === 2 ? 230 : 200, v === 3 ? 190 : 165, v === 3 ? 1.2 : 1.6)]" :key="i">
        <path :d="f.body" :fill="`url(#${id('figure')})`" />
        <circle v-bind="f.head" :fill="c[3]" />
        <circle :cx="f.head.cx - f.head.r * 0.35" :cy="f.head.cy - f.head.r * 0.3" :r="f.head.r * 0.9" :fill="c[4]" opacity="0.12" />
      </template>
    </g>

    <!-- ---------- Bouquet ---------- -->
    <g v-else-if="art.scene === 'bouquet'">
      <rect width="400" height="400" :fill="`url(#${id('bg')})`" />
      <rect y="300" width="400" height="100" :fill="c[1]" />
      <rect y="300" width="400" height="3" :fill="c[3]" opacity="0.15" />
      <g :stroke="c[3]" stroke-width="3" opacity="0.6">
        <line v-for="i in 5" :key="i" :x1="bouquet.cx - 30 + i * 10" y1="190" :x2="bouquet.cx - 6 + i * 2" y2="290" />
      </g>
      <path :d="`M${bouquet.cx - 34},250 h68 l-10,60 h-48 z`" :fill="c[2]" />
      <ellipse
        v-for="(leaf, i) in bouquet.leaves"
        :key="`l${i}`"
        :cx="leaf.cx"
        :cy="leaf.cy"
        rx="26"
        ry="9"
        :fill="c[3]"
        opacity="0.55"
        :transform="`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`"
      />
      <g v-for="(flower, i) in bouquet.flowers" :key="`f${i}`">
        <circle v-bind="flower" />
        <circle :cx="flower.cx" :cy="flower.cy" :r="flower.r * 0.32" :fill="c[3]" opacity="0.35" />
      </g>
    </g>

    <!-- ---------- Rings / small objects on fabric ---------- -->
    <g v-else-if="art.scene === 'rings'">
      <rect width="400" height="400" :fill="`url(#${id('bg')})`" />
      <path d="M-10,120 C120,60 220,200 410,110 V410 H-10 Z" :fill="c[1]" opacity="0.7" />
      <path d="M-10,260 C140,200 260,330 410,250 V410 H-10 Z" :fill="c[2]" opacity="0.35" />
      <template v-if="v < 2">
        <ellipse cx="190" cy="205" rx="46" ry="40" fill="none" :stroke="c[3]" stroke-opacity="0.25" stroke-width="14" transform="translate(6 8)" />
        <ellipse cx="190" cy="200" rx="46" ry="40" fill="none" :stroke="c[2]" stroke-width="11" />
        <ellipse cx="190" cy="200" rx="46" ry="40" fill="none" :stroke="c[4]" stroke-width="3" stroke-dasharray="40 250" />
        <ellipse cx="238" cy="222" rx="38" ry="33" fill="none" :stroke="c[2]" stroke-width="8" />
        <ellipse cx="238" cy="222" rx="38" ry="33" fill="none" :stroke="c[4]" stroke-width="2.5" stroke-dasharray="30 220" />
      </template>
      <template v-else>
        <ellipse cx="160" cy="200" rx="40" ry="28" :fill="c[2]" />
        <ellipse cx="160" cy="194" rx="28" ry="16" :fill="c[4]" opacity="0.6" />
        <ellipse cx="245" cy="230" rx="34" ry="24" :fill="c[3]" opacity="0.7" />
        <ellipse cx="245" cy="225" rx="22" ry="12" :fill="c[4]" opacity="0.4" />
        <circle cx="215" cy="160" r="12" :fill="c[2]" opacity="0.8" />
      </template>
    </g>

    <!-- ---------- Forest ---------- -->
    <g v-else-if="art.scene === 'forest'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <polygon points="230,0 300,0 180,400 60,400" :fill="c[4]" opacity="0.45" />
      <rect v-for="(tree, i) in forest" :key="i" :x="tree.x" y="0" :width="tree.w" height="400" :fill="tree.fill" :opacity="tree.opacity" />
      <path :d="wave(350, 8, 60, 1)" :fill="c[2]" />
    </g>

    <!-- ---------- Family group ---------- -->
    <g v-else-if="art.scene === 'family'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <circle cx="200" cy="230" r="120" :fill="`url(#${id('glow')})`" />
      <template v-for="(f, i) in family" :key="i">
        <path :d="f.body" :fill="c[3]" :opacity="0.82 + (i % 2) * 0.12" />
        <circle v-bind="f.head" :fill="c[3]" :opacity="0.82 + (i % 2) * 0.12" />
      </template>
      <path :d="wave(318, 10, 90, 0.4)" :fill="c[2]" />
      <circle v-if="v === 3" cx="190" cy="300" r="12" :fill="c[4]" />
    </g>

    <!-- ---------- Child in a meadow ---------- -->
    <g v-else-if="art.scene === 'child'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <circle cx="120" cy="120" r="80" :fill="`url(#${id('glow')})`" />
      <path :d="wave(290, 14, 90, v)" :fill="c[1]" />
      <template v-if="v === 1">
        <path :d="figure(270, 120, 1.7).body" :fill="c[3]" opacity="0.7" />
        <circle v-bind="figure(270, 120, 1.7).head" :fill="c[3]" opacity="0.7" />
      </template>
      <template v-for="(f, i) in [figure(v === 2 ? 250 : 190, 225, 0.85)]" :key="i">
        <path :d="f.body" :fill="`url(#${id('figure')})`" />
        <circle v-bind="f.head" :fill="c[3]" />
      </template>
      <path :d="wave(340, 10, 60, 2)" :fill="c[2]" />
      <g :stroke="c[3]" stroke-width="2" opacity="0.35">
        <line v-for="i in 12" :key="i" :x1="i * 33" y1="350" :x2="i * 33 + 4" y2="332" />
      </g>
    </g>

    <!-- ---------- Still life ---------- -->
    <g v-else-if="art.scene === 'still'">
      <rect width="400" height="400" :fill="c[0]" />
      <polygon points="60,0 220,0 140,260 -20,260" :fill="c[4]" opacity="0.7" />
      <rect y="260" width="400" height="140" :fill="c[1]" />
      <ellipse cx="200" cy="300" rx="150" ry="24" :fill="c[3]" opacity="0.08" />
      <template v-if="v === 2">
        <rect x="90" y="250" width="160" height="70" rx="4" :fill="c[4]" transform="rotate(-8 170 285)" />
        <path d="M110,280 q40,-20 80,4 t60,-6" fill="none" :stroke="c[2]" stroke-width="3" transform="rotate(-8 170 285)" />
        <circle cx="290" cy="290" r="22" :fill="c[3]" opacity="0.75" />
      </template>
      <template v-else>
        <path :d="v === 3 ? 'M140,300 q-10,-60 30,-70 q40,10 30,70 z' : 'M150,300 c-14,-40 0,-80 14,-96 v-24 h20 v24 c14,16 28,56 14,96 z'" :fill="c[2]" />
        <rect :x="v === 1 ? 215 : 230" y="262" width="54" height="42" rx="6" :fill="c[3]" opacity="0.8" />
        <path :d="`M${v === 1 ? 269 : 284},272 a12,12 0 0 1 0,24`" fill="none" :stroke="c[3]" stroke-opacity="0.8" stroke-width="6" />
        <ellipse :cx="v === 1 ? 300 : 120" cy="312" rx="36" ry="8" :fill="c[4]" />
      </template>
    </g>

    <!-- ---------- Window light ---------- -->
    <g v-else-if="art.scene === 'window'">
      <rect width="400" height="400" :fill="c[1]" />
      <polygon points="120,90 280,90 380,400 60,400" :fill="c[4]" opacity="0.35" />
      <rect x="130" y="60" width="140" height="190" :rx="v === 2 ? 70 : 4" :fill="`url(#${id('sky')})`" />
      <rect v-if="v !== 2" x="130" y="205" width="140" height="45" :fill="c[2]" opacity="0.45" />
      <g :stroke="c[0]" stroke-width="7">
        <rect x="130" y="60" width="140" height="190" :rx="v === 2 ? 70 : 4" fill="none" />
        <line x1="200" y1="60" x2="200" y2="250" />
        <line x1="130" y1="150" x2="270" y2="150" />
      </g>
      <rect x="110" y="250" width="180" height="10" :fill="c[0]" />
      <rect v-if="v === 3" x="96" y="56" width="30" height="200" :fill="c[2]" />
      <rect v-if="v === 3" x="274" y="56" width="30" height="200" :fill="c[2]" />
      <g v-if="v !== 3">
        <path d="M232,250 h30 l-5,-26 h-20 z" :fill="c[3]" opacity="0.8" />
        <ellipse cx="240" cy="214" rx="20" ry="7" :fill="c[3]" opacity="0.6" transform="rotate(-30 240 214)" />
        <ellipse cx="256" cy="210" rx="18" ry="6" :fill="c[3]" opacity="0.6" transform="rotate(25 256 210)" />
      </g>
    </g>

    <!-- ---------- Balloons ---------- -->
    <g v-else-if="art.scene === 'balloons'">
      <rect width="400" height="400" :fill="`url(#${id('sky')})`" />
      <g :stroke="c[3]" stroke-width="1.5" opacity="0.45">
        <line v-for="(b, i) in balloons" :key="`s${i}`" :x1="b.cx" :y1="b.cy + 34" x2="205" y2="310" />
      </g>
      <g v-for="(b, i) in balloons" :key="`b${i}`">
        <ellipse :cx="b.cx" :cy="b.cy" rx="28" ry="34" :fill="b.fill" />
        <ellipse :cx="b.cx - 9" :cy="b.cy - 12" rx="7" ry="10" fill="#fff" opacity="0.35" />
      </g>
      <template v-if="v === 0">
        <path :d="figure(205, 318, 0.75).body" :fill="c[3]" />
        <circle v-bind="figure(205, 318, 0.75).head" :fill="c[3]" />
      </template>
      <path v-else :d="wave(350, 10, 70, 2)" :fill="c[2]" />
    </g>
  </svg>
</template>
