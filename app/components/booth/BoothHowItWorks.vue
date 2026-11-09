<script setup lang="ts">
import { Camera, Images, Palette, ScanFace } from '@lucide/vue'
import type { Component } from 'vue'
import { boothSteps, type BoothStep } from '~/config/booth'

const icons: Record<BoothStep['icon'], Component> = {
  camera: Camera,
  style: Palette,
  processing: ScanFace,
  result: Images,
}

const LAST = boothSteps.length - 1

/*
 * Scroll-driven timeline.
 *
 * `progress` runs from -1 (nothing reached) to LAST (line reached the last icon) and follows the page
 * scroll in both directions. Step i is "done" once progress ≥ i; the current step is floor(progress).
 * Connector i (between icon i and i+1) is filled by clamp(progress − i, 0, 1).
 *
 * - Mobile (vertical): the line tip follows a reading anchor at 60% of the viewport height,
 *   measured against the real icon centres — so it always starts and ends exactly on an icon.
 * - Desktop (horizontal): the list's scroll position through the viewport is mapped to progress.
 * - Without JS and with reduced motion everything is shown as completed (no scroll listener at all).
 */
const progress = ref(LAST)
const active = computed(() => (progress.value < 0 ? -1 : Math.floor(progress.value + 0.001)))

const list = useTemplateRef<HTMLOListElement>('list')
const iconEls = useTemplateRef<HTMLElement[]>('iconEls')
const { isInView } = useInView(list, { rootMargin: '200px 0px' })

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function measure() {
  const icons = iconEls.value
  if (!list.value || !icons?.length) return
  const vh = window.innerHeight
  const centres = icons.map((el) => {
    const rect = el.getBoundingClientRect()
    return rect.top + rect.height / 2
  })
  const horizontal = Math.abs(centres[LAST]! - centres[0]!) < 4

  if (horizontal) {
    // Starts when the row is at 80% of the viewport, completes at 40%.
    const t = clamp((vh * 0.8 - centres[0]!) / (vh * 0.4), 0, 1)
    progress.value = t * (LAST + 1) - 1
    return
  }

  const anchor = vh * 0.6
  if (anchor < centres[0]!) {
    progress.value = -1
    return
  }
  for (let i = 0; i < LAST; i++) {
    const from = centres[i]!
    const to = centres[i + 1]!
    if (anchor < to) {
      progress.value = i + (anchor - from) / (to - from)
      return
    }
  }
  progress.value = LAST
}

let frame = 0
const onScroll = () => {
  if (!frame) {
    frame = requestAnimationFrame(() => {
      frame = 0
      measure()
    })
  }
}

let enabled = false
const detach = () => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

onMounted(() => {
  enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (enabled) measure()
})

// Listeners live only while the timeline is near the viewport.
watch(isInView, (visible) => {
  detach()
  if (!enabled || !visible) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  measure()
})

onBeforeUnmount(detach)

const segmentFill = (index: number) => clamp(progress.value - index, 0, 1)
</script>

<template>
  <section id="how-it-works" class="section-y bg-surface" aria-labelledby="how-title">
    <div class="container-page">
      <SectionHeading v-reveal eyebrow="Как это работает" title="Всего несколько шагов до нового образа" heading-id="how-title" />

      <ol ref="list" class="mt-12 grid gap-10 md:mt-16 lg:grid-cols-4 lg:gap-6">
        <li
          v-for="(step, index) in boothSteps"
          :key="step.title"
          class="relative grid grid-cols-[3rem_minmax(0,1fr)] content-start gap-x-5 lg:grid-cols-1 lg:justify-items-center lg:gap-y-6 lg:text-center"
          :class="index <= active ? 'is-done' : 'is-waiting'"
          :aria-current="index === active ? 'step' : undefined"
        >
          <!--
            Connector to the next icon: from this icon's centre to the next one's centre.
            Vertical: li height + row gap (2.5rem). Horizontal: column width + column gap (1.5rem).
          -->
          <span
            v-if="index < LAST"
            class="connector pointer-events-none absolute bg-border"
            aria-hidden="true"
          >
            <span class="connector-fill absolute inset-0 bg-accent" :style="{ '--fill': segmentFill(index) }" />
          </span>

          <div
            ref="iconEls"
            class="step-icon relative z-10 inline-flex size-12 items-center justify-center overflow-hidden rounded-full border bg-surface transition-[background-color,border-color,color,transform] duration-(--motion-slow) ease-enter"
          >
            <component :is="icons[step.icon]" class="size-5" :stroke-width="1.5" aria-hidden="true" />
            <!-- AI processing: a light scan line, plays when the timeline reaches this step. -->
            <span
              v-if="step.icon === 'processing'"
              class="scan-line pointer-events-none absolute inset-x-1.5 top-0 h-px bg-current opacity-0"
              :class="index <= active && 'is-scanning'"
              aria-hidden="true"
            />
          </div>

          <div class="flex flex-col gap-2 pt-1 lg:max-w-[16rem] lg:pt-0">
            <span class="font-display text-xl text-muted" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3 class="text-lg font-semibold">{{ step.title }}</h3>
            <p class="text-[0.9375rem] leading-relaxed text-muted">{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* Vertical connector (mobile / tablet): centred under the 48px icon. */
.connector {
  top: 1.5rem;
  left: calc(1.5rem - 0.5px);
  width: 1px;
  height: calc(100% + 2.5rem);
}

.connector-fill {
  transform-origin: top;
  transform: scaleY(var(--fill, 1));
  transition: transform 120ms linear;
}

/* Horizontal connector (desktop): from the icon centre to the next column's icon centre. */
@media (min-width: 1024px) {
  .connector {
    left: 50%;
    width: calc(100% + 1.5rem);
    height: 1px;
  }

  .connector-fill {
    transform-origin: left;
    transform: scaleX(var(--fill, 1));
  }
}

.is-waiting .step-icon {
  border-color: var(--color-border);
  color: var(--color-muted-soft);
}

.is-done .step-icon {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

li[aria-current='step'] .step-icon {
  background-color: var(--color-accent);
  color: var(--color-white);
  transform: scale(1.08);
}

@media (prefers-reduced-motion: no-preference) {
  .scan-line.is-scanning {
    animation: booth-scan 1.4s var(--ease-standard) 3;
  }
}

@keyframes booth-scan {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  20%,
  80% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translateY(40px);
  }
}
</style>
