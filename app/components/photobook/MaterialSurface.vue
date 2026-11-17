<script setup lang="ts">
/**
 * A material surface: binding fabric, leatherette grain or paper, in a given colour.
 * Fills its (positioned) parent. Shared by the 3D cover, swatches and the materials section,
 * so a texture looks the same everywhere. Textures are tiny inline SVG noise — no image requests.
 */
withDefaults(
  defineProps<{
    surface: 'linen' | 'grain' | 'print' | 'matte' | 'gloss' | 'texture' | 'plain'
    color: string
    /** Extra light falloff for large surfaces (cover front). */
    lit?: boolean
  }>(),
  { lit: false },
)
</script>

<template>
  <span class="material absolute inset-0" :class="[`is-${surface}`, lit && 'is-lit']" :style="{ backgroundColor: color }" aria-hidden="true" />
</template>

<style scoped>
.material {
  transition: background-color var(--motion-slow) var(--ease-standard);
}

.material::before,
.material::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Woven binding cloth: fine warp and weft + soft irregularity. */
.is-linen::before {
  background-image:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.07) 0 1px, transparent 1px 3px),
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.09) 0 1px, transparent 1px 3px),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.06 0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
  opacity: 0.75;
}

/* Leatherette: pebbled grain lit from the top-left + a soft satin sheen. */
.is-grain::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.42' numOctaves='2' seed='4' stitchTiles='stitch'/%3E%3CfeDiffuseLighting lighting-color='%23fff' surfaceScale='2.2'%3E%3CfeDistantLight azimuth='225' elevation='52'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
  background-size: 120px 120px;
  mix-blend-mode: multiply;
  opacity: 0.42;
}

.is-grain::after {
  background: linear-gradient(120deg, rgb(255 255 255 / 0.16), transparent 35%, transparent 65%, rgb(255 255 255 / 0.07));
}

/* Papers. */
.is-texture::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3CfeDiffuseLighting lighting-color='%23fff' surfaceScale='1.6'%3E%3CfeDistantLight azimuth='45' elevation='58'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23t)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
  opacity: 0.45;
}

.is-gloss::after {
  background: linear-gradient(115deg, transparent 25%, rgb(255 255 255 / 0.85) 45%, transparent 60%);
  opacity: 0.6;
}

.is-matte::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Light falloff across a large board: brighter near the light, darker towards the fore-edge. */
.is-lit::after {
  background:
    linear-gradient(105deg, rgb(255 255 255 / 0.14), transparent 38%, transparent 70%, rgb(0 0 0 / 0.1)),
    linear-gradient(180deg, rgb(255 255 255 / 0.06), transparent 30%);
}

.is-grain.is-lit::after {
  background:
    linear-gradient(120deg, rgb(255 255 255 / 0.2), transparent 35%, transparent 65%, rgb(255 255 255 / 0.07)),
    linear-gradient(105deg, transparent 60%, rgb(0 0 0 / 0.12));
}
</style>
