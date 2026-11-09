<script setup lang="ts">
import { ArrowDown, ArrowRight, Palette, Sparkles, UsersRound } from '@lucide/vue'
import type { Component } from 'vue'
import { boothHeroBenefits, boothHeroPortraits, type HeroPortraitRole } from '~/config/booth'
import { buildOrderLink } from '~/config/order'

/*
 * AI Editorial hero: a dark "stage" with an art-directed collage of AI portraits.
 * Deliberately unlike the home hero (light background, single photo, decorative ring).
 */

const orderLink = buildOrderLink({ service: 'booth' })

/* ---------- Collage layout (positional, by role) ---------- */

interface Slot {
  /** Card position / size / tilt. Mobile first; the fashion card joins from `sm`. */
  class: string
  ratio: string
  sizes: string
  /** Pointer parallax depth in px (desktop only). The main portrait never moves. */
  depth: number
  /** Entrance order. */
  delay: number
}

const slots: Record<HeroPortraitRole, Slot> = {
  main: {
    class: 'right-0 top-[3%] z-10 w-[66%] sm:right-[6%] sm:w-[58%] lg:right-[4%] lg:w-[60%]',
    ratio: '4 / 5',
    sizes: '(min-width: 1024px) 360px, (min-width: 640px) 300px, 66vw',
    depth: 0,
    delay: 260,
  },
  fantasy: {
    class: 'left-0 top-0 z-0 w-[44%] -rotate-4 sm:left-[2%] sm:w-[36%] lg:left-0 lg:w-[38%]',
    ratio: '3 / 4',
    sizes: '(min-width: 1024px) 230px, (min-width: 640px) 190px, 44vw',
    depth: 10,
    delay: 380,
  },
  original: {
    class: 'bottom-0 left-[3%] z-20 w-[40%] rotate-3 sm:left-[8%] sm:w-[30%] lg:left-[4%] lg:w-[31%]',
    ratio: '4 / 5',
    sizes: '(min-width: 1024px) 190px, (min-width: 640px) 160px, 40vw',
    depth: 6,
    delay: 500,
  },
  fashion: {
    class: 'hidden sm:block bottom-[4%] right-0 z-20 w-[28%] rotate-2 lg:-right-[2%] lg:w-[29%]',
    ratio: '3 / 4',
    sizes: '(min-width: 1024px) 180px, 150px',
    depth: 9,
    delay: 620,
  },
}

const portraits = boothHeroPortraits.map((portrait) => ({ ...portrait, slot: slots[portrait.role] }))

const benefitIcons: Component[] = [Sparkles, UsersRound, Palette]

/* ---------- Pointer float (desktop, fine pointer, full motion only) ---------- */

const stage = useTemplateRef<HTMLElement>('stage')
const collage = useTemplateRef<HTMLElement>('collage')
const { isInView } = useInView(stage, { initial: true })
const { fullMotion } = useMotionLevel()

let canFloat = false
let frame = 0
let pointer = { x: 0, y: 0 }

function applyPointer() {
  frame = 0
  collage.value?.style.setProperty('--mx', pointer.x.toFixed(3))
  collage.value?.style.setProperty('--my', pointer.y.toFixed(3))
}

function onPointerMove(event: PointerEvent) {
  if (!canFloat || !isInView.value || event.pointerType !== 'mouse' || !stage.value) return
  const rect = stage.value.getBoundingClientRect()
  // -1…1 relative to the stage centre.
  pointer = {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
  }
  if (!frame) frame = requestAnimationFrame(applyPointer)
}

function onPointerLeave() {
  pointer = { x: 0, y: 0 }
  if (!frame) frame = requestAnimationFrame(applyPointer)
}

onMounted(() => {
  canFloat =
    fullMotion.value && window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <section class="px-2 pt-1 sm:px-3 lg:px-4" aria-labelledby="booth-hero-title">
    <div
      ref="stage"
      class="booth-stage relative isolate overflow-hidden rounded-[1.5rem] text-bg sm:rounded-[1.75rem]"
      @pointermove.passive="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <!-- Ambient light: static radial gradients, no blur filters, no loops. -->
      <div class="booth-ambient pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ring-1 ring-white/8 ring-inset" aria-hidden="true" />

      <div
        class="container-page grid gap-12 pt-10 pb-8 sm:pt-14 md:gap-14 lg:min-h-[calc(100svh-var(--header-height)-0.75rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:grid-rows-[1fr_auto] lg:gap-x-12 lg:gap-y-10 lg:pt-16 xl:gap-x-20"
      >
        <!-- ---------- Editorial copy ---------- -->
        <div class="flex flex-col items-start gap-6 self-center md:gap-7">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pr-3.5 pl-2.5 text-[0.6875rem] font-semibold tracking-[0.2em] text-bg/80 uppercase motion-safe:animate-hero-enter"
          >
            <Sparkles class="size-3.5 text-(--hero-accent)" :stroke-width="2" aria-hidden="true" />
            AI Photobooth Experience
          </p>

          <!-- LCP-safe: the heading only rises (transform), it is never transparent. -->
          <h1
            id="booth-hero-title"
            class="booth-title font-display motion-safe:animate-hero-rise motion-safe:[animation-delay:60ms]"
          >
            <span class="block">Ваши гости.</span>
            <span class="block text-(--hero-accent) italic">Новые образы.</span>
            <span class="block">Незабываемые эмоции.</span>
          </h1>

          <p
            class="max-w-[33rem] text-lead text-bg/72 motion-safe:animate-hero-enter motion-safe:[animation-delay:140ms]"
          >
            Представьте: обычная фотография превращается в кинематографичный портрет, фантастический образ или
            обложку модного журнала. Всё это — прямо на вашем мероприятии.
          </p>

          <div
            class="mt-1 flex w-full flex-col gap-3 motion-safe:animate-hero-enter motion-safe:[animation-delay:220ms] sm:w-auto sm:flex-row"
          >
            <BaseButton :to="orderLink" size="lg" block class="sm:w-auto">
              Заказать фотобудку
              <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
            </BaseButton>
            <BaseButton to="#gallery" size="lg" variant="secondary" block class="sm:w-auto">
              Посмотреть примеры
              <template #icon><ArrowDown class="size-4" :stroke-width="2" /></template>
            </BaseButton>
          </div>
        </div>

        <!-- ---------- AI portrait collage ---------- -->
        <div class="relative self-center">
          <!-- Light pool behind the collage -->
          <div
            class="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[120%] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.42),transparent)]"
            aria-hidden="true"
          />

          <div
            ref="collage"
            class="booth-collage relative mx-auto aspect-[1/1.06] w-full max-w-[26rem] sm:aspect-[1/0.92] sm:max-w-[36rem] lg:aspect-[1/1.02] lg:max-w-none"
          >
            <figure
              v-for="portrait in portraits"
              :key="portrait.role"
              class="booth-card absolute"
              :class="[portrait.slot.class, portrait.role === 'main' ? 'is-main' : 'is-secondary']"
              :style="{ '--depth': portrait.slot.depth, '--delay': `${portrait.slot.delay}ms` }"
            >
              <div
                class="rounded-[0.875rem] bg-[#352e3c] p-1.5 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.65)] ring-1 ring-white/12 sm:p-2"
              >
                <PhotoFrame
                  :image="portrait.image"
                  :ratio="portrait.slot.ratio"
                  :sizes="portrait.slot.sizes"
                  :priority="portrait.role === 'main'"
                  :rounded="false"
                  tone="dark"
                  class="rounded-[0.5rem]"
                />
                <figcaption
                  v-if="portrait.label"
                  class="flex items-center gap-1.5 px-1 pt-2 pb-0.5 text-[0.625rem] font-semibold tracking-[0.16em] uppercase sm:text-[0.6875rem]"
                  :class="portrait.role === 'original' ? 'text-bg/60' : 'text-bg/85'"
                >
                  <Sparkles
                    v-if="portrait.role !== 'original'"
                    class="size-3 shrink-0 text-(--hero-accent)"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  <span class="line-clamp-2 leading-snug">{{ portrait.label }}</span>
                  <ArrowRight
                    v-if="portrait.role === 'original'"
                    class="ml-auto size-3 shrink-0 text-(--hero-accent)"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                </figcaption>
              </div>
            </figure>
          </div>
        </div>

        <!-- ---------- Supporting benefits ---------- -->
        <ul
          class="grid gap-3 border-t border-white/12 pt-6 motion-safe:animate-hero-enter motion-safe:[animation-delay:760ms] sm:grid-cols-3 sm:gap-0 lg:col-span-2"
        >
          <li
            v-for="(benefit, index) in boothHeroBenefits"
            :key="benefit"
            class="flex items-center gap-3 text-sm text-bg/80 sm:px-5 sm:first:pl-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-white/12"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/6 text-(--hero-accent) ring-1 ring-white/12"
              aria-hidden="true"
            >
              <component :is="benefitIcons[index]" class="size-4" :stroke-width="1.75" />
            </span>
            {{ benefit }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booth-stage {
  /* Hero-only palette, derived from brand tokens. */
  --hero-bg: #29232f;
  --hero-accent: color-mix(in oklab, var(--color-accent) 55%, var(--color-white));
  background-color: var(--hero-bg);
}

.booth-ambient {
  background:
    radial-gradient(60% 55% at 78% 38%, rgb(117 100 168 / 0.32), transparent 70%),
    radial-gradient(45% 50% at 0% 100%, rgb(117 100 168 / 0.16), transparent 70%),
    linear-gradient(180deg, rgb(255 255 255 / 0.03), transparent 40%);
}

.booth-title {
  font-size: clamp(2.5rem, 1.6rem + 3.9vw, 4.75rem);
  line-height: 1.02;
  letter-spacing: -0.015em;
}

/* Pointer float: secondary cards drift a few px; values are 0 unless enabled (desktop, fine pointer). */
.booth-card {
  transform: translate3d(calc(var(--mx, 0) * var(--depth) * 1px), calc(var(--my, 0) * var(--depth) * 1px), 0);
  transition: transform 700ms var(--ease-enter);
}

@media (prefers-reduced-motion: no-preference) {
  /* Editorial unveil: secondary prints slide open from the middle. `backwards` → no clip after the end. */
  .booth-card.is-secondary {
    animation: portrait-unveil 800ms var(--ease-enter) var(--delay) backwards;
  }

  /* The main portrait is the likely LCP image: it is never fully hidden, only opens from a near-full frame. */
  .booth-card.is-main {
    animation: portrait-open 900ms var(--ease-enter) var(--delay) backwards;
  }
}

@keyframes portrait-unveil {
  from {
    opacity: 0;
    scale: 1.05;
    clip-path: inset(22% 0 22% 0 round 14px);
  }
  to {
    opacity: 1;
    scale: 1;
    clip-path: inset(0 0 0 0 round 14px);
  }
}

@keyframes portrait-open {
  from {
    scale: 1.03;
    clip-path: inset(5% 5% 5% 5% round 14px);
  }
  to {
    scale: 1;
    clip-path: inset(0 0 0 0 round 14px);
  }
}
</style>
