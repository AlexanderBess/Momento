<script setup lang="ts">
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { findCoverType } from '~/config/photobook/covers'
import { heroClosedBook, heroOpenBook, heroPrints } from '~/config/photobook/hero'
import { createConfig } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

/*
 * Editorial Product Showcase — «История, которую можно держать в руках».
 *
 * The first screen is a product still life: a large open photobook lying on the table in
 * perspective (the hero object), a closed linen-bound volume standing behind it (its cover colour
 * can be switched) and two loose prints. Everything is rendered from the studio's own book
 * components, so it never drifts from what the configurator produces.
 *
 * Product photos: app/config/photobook/hero.ts. Each object (open book, closed book per colour,
 * prints) switches from the rendered book to a real cut-out photo as soon as its `src` is set;
 * a photo that fails to load falls back to the rendered book.
 */

type HeroCover = keyof typeof heroClosedBook

/** Objects whose photo failed to load in this visit. */
const failed = reactive(new Set<'open' | 'closed' | 'prints'>())

const openPhoto = computed(() => Boolean(heroOpenBook.src) && !failed.has('open'))
// All four colours or none — a switch must never jump between a photo and a rendered book.
const closedPhoto = computed(
  () => Object.values(heroClosedBook).every((image) => image.src) && !failed.has('closed'),
)
// Next to a real photo the illustrated prints would look out of place: photo prints or none.
const printPhotos = computed(() => heroPrints.every((p) => p.src) && !failed.has('prints'))

/* ---------- Main open book ---------- */

const openBook: PhotobookConfig = (() => {
  const base = createConfig('weddingStory')
  const spread = {
    id: 'hero',
    layout: 'editorial' as const,
    images: ['wedding-dusk', 'wedding-sea', 'wedding-rings'],
    options: { caption: '' },
  }
  return { ...base, coverColor: 'sand', paperType: 'matte', spreads: [spread], activeSpreadId: spread.id }
})()

const prints = [
  { id: 'wedding-bouquet', class: 'left-[1%] top-[30%] w-[21%] -rotate-[9deg]', delay: 650 },
  { id: 'wedding-field', class: 'left-[13%] top-[17%] w-[17%] rotate-[5deg]', delay: 760 },
]

/* ---------- Closed book with switchable cover colour ---------- */

// Only colours present in the studio's fabric range, so the hero never shows an unorderable option.
const fabric = findCoverType('fabric')
const coverColors = (['milk', 'sand', 'violet', 'graphite'] as const).map((id) => ({
  ...fabric.colors.find((c) => c.id === id)!,
  id,
}))

const coverColor = ref<HeroCover>('sand')
const coverLabel = computed(() => coverColors.find((c) => c.id === coverColor.value)?.label)

const closedBook = computed<PhotobookConfig>(() => ({
  ...createConfig('weddingStory'),
  coverType: 'fabric',
  coverColor: coverColor.value,
  coverTitle: 'Наша история',
  coverTitleColor: 'blind',
  coverTitlePosition: 'center',
  extras: { embossing: false, spineText: true },
}))

const uid = useId()
</script>

<template>
  <section class="pb-hero relative clip-x -mt-(--header-height) pt-(--header-height)" aria-labelledby="photobook-hero-title">
    <div
      class="container-page grid items-center gap-10 pt-8 pb-14 md:pt-12 md:pb-16 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:py-10 xl:gap-12"
    >
      <!-- ---------- Copy ---------- -->
      <div class="relative z-10 flex flex-col items-start gap-6 md:max-w-[36rem] lg:gap-7">
        <p class="eyebrow flex items-center gap-3 motion-safe:animate-hero-enter">
          <span class="h-px w-8 bg-accent" aria-hidden="true" />
          Фотокниги · MOMENTO Book Studio
        </p>

        <!-- LCP-safe: the heading only rises (transform), it is never transparent. -->
        <h1 id="photobook-hero-title" class="hero-title font-display text-text motion-safe:animate-hero-rise">
          <!-- Inline on phones (natural wrapping) — the trailing spaces keep the words apart. -->
          <span class="sm:block">Фотокнига — это </span>
          <span class="sm:block">не просто фотографии. </span>
          <em class="block text-accent italic">Это ваша история.</em>
        </h1>

        <!--
          The brief's Taupe #81766D is 3.9:1 on ivory — below AA for body text. text-muted is the same hue,
          darkened to 5.2:1 (see tokens.css), so the paragraph stays readable.
        -->
        <p class="max-w-[29rem] text-lead text-muted motion-safe:animate-hero-enter motion-safe:[animation-delay:100ms]">
          Соберите любимые моменты в книгу, к которой захочется возвращаться. Выберите формат, обложку и оформление —
          остальное мы сделаем вместе.
        </p>

        <div
          class="mt-1 flex w-full flex-col gap-3 motion-safe:animate-hero-enter motion-safe:[animation-delay:180ms] sm:w-auto sm:flex-row"
        >
          <BaseButton to="#studio" size="lg" block class="sm:w-auto">
            Создать фотокнигу
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
          <BaseButton to="#collections" size="lg" variant="secondary" block class="sm:w-auto">
            Посмотреть коллекции
            <template #icon><ArrowDown class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>
      </div>

      <!-- ---------- Product still life ---------- -->
      <div class="relative mx-auto w-full max-w-[40rem] lg:max-w-none">
        <div class="scene relative aspect-[1/0.9] w-full sm:aspect-[1/0.8]">
          <!-- Warm window light falling on the table -->
          <span class="light pointer-events-none absolute inset-[-8%]" aria-hidden="true" />

          <!-- Secondary: closed linen volume standing behind -->
          <!-- With the open-book photo the volume stands lower, its foot hidden behind the open book. -->
          <div
            class="closed absolute"
            :class="[
              closedPhoto && 'is-photo',
              openPhoto ? 'top-[6%] right-[7%] h-[52%] w-[40%]' : 'top-[-3%] right-0 h-[64%] w-[50%]',
            ]"
          >
            <!-- One photo per colour, stacked: switching is a cross-fade, never a reload. -->
            <div v-if="closedPhoto" class="relative size-full">
              <NuxtImg
                v-for="color in coverColors"
                :key="color.id"
                :src="heroClosedBook[color.id].src!"
                :alt="heroClosedBook[color.id].alt"
                :width="heroClosedBook[color.id].width"
                :height="heroClosedBook[color.id].height"
                :aria-hidden="coverColor !== color.id || undefined"
                sizes="200px sm:320px"
                loading="eager"
                decoding="async"
                class="closed-photo absolute inset-0 size-full object-contain object-bottom"
                :class="coverColor === color.id && 'is-active'"
                @error="failed.add('closed')"
              />
            </div>
            <PhotobookCover v-else :config="closedBook" plain :fit="[0.7, 0.92]" sizes="240px" aria-hidden="true" />
          </div>

          <!-- Details: loose prints on the table (photo cut-outs, or the illustrated ones with rendered books) -->
          <template v-if="openPhoto">
            <div
              v-for="(print, i) in printPhotos ? heroPrints : []"
              :key="print.src!"
              class="print-photo absolute"
              :class="prints[i]!.class"
              :style="{ '--delay': `${prints[i]!.delay}ms`, aspectRatio: `${print.width} / ${print.height}` }"
            >
              <NuxtImg
                :src="print.src!"
                :alt="print.alt"
                :width="print.width"
                :height="print.height"
                sizes="160px"
                loading="eager"
                class="size-full object-contain"
                @error="failed.add('prints')"
              />
            </div>
          </template>
          <div
            v-for="print in openPhoto ? [] : prints"
            :key="print.id"
            class="print absolute bg-surface p-[1.2%] pb-[3.5%] shadow-(--shadow-raised)"
            :class="print.class"
            :style="{ '--delay': `${print.delay}ms` }"
            aria-hidden="true"
          >
            <div class="relative aspect-[4/5]">
              <PhotobookImage :image-id="print.id" sizes="140px" />
            </div>
          </div>

          <!-- Hero object: the open book lying on the table -->
          <div
            class="main absolute"
            :class="openPhoto ? 'is-photo inset-x-[-3%] top-[16%] bottom-[-2%]' : 'inset-x-0 top-[27%] bottom-[2%]'"
          >
            <span class="main-shadow pointer-events-none absolute" aria-hidden="true" />
            <!-- The photo is already shot in perspective: no CSS tilt, only a gentle lift on hover. -->
            <div v-if="openPhoto" class="main-photo size-full">
              <NuxtImg
                :src="heroOpenBook.src!"
                :alt="heroOpenBook.alt"
                :width="heroOpenBook.width"
                :height="heroOpenBook.height"
                sizes="400px sm:640px lg:680px"
                loading="eager"
                fetchpriority="high"
                :preload="{ fetchPriority: 'high' }"
                decoding="async"
                class="size-full object-contain object-bottom"
                @error="failed.add('open')"
              />
            </div>
            <div v-else class="main-tilt size-full" aria-hidden="true">
              <PhotobookSpread :config="openBook" spread-id="hero" :fit="[0.97, 0.98]" sizes="320px lg:380px">
                <template #overlay>
                  <!-- Visible thickness of the page block and the board below it -->
                  <span class="block-edge" />
                  <span class="board-edge" />
                </template>
              </PhotobookSpread>
            </div>
          </div>
        </div>

        <!-- Cover colour switcher + product caption -->
        <div class="mt-6 flex flex-col items-center gap-3 sm:mt-5 sm:flex-row sm:justify-between sm:gap-6">
          <fieldset class="flex items-center gap-3">
            <legend class="sr-only">Цвет обложки закрытой книги</legend>
            <span class="text-xs font-semibold text-muted" aria-hidden="true">
              Обложка: <span class="text-text">{{ coverLabel }}</span>
            </span>
            <div class="flex">
              <label
                v-for="color in coverColors"
                :key="color.id"
                class="swatch size-10!"
                :class="coverColor === color.id && 'is-selected'"
                :title="color.label"
              >
                <input v-model="coverColor" type="radio" :name="`${uid}-cover`" class="sr-only" :value="color.id" :aria-label="color.label" >
                <span class="swatch-dot size-7!">
                  <MaterialSurface surface="plain" :color="color.hex" />
                </span>
              </label>
            </div>
          </fieldset>

          <p class="flex flex-col items-center text-center sm:items-end sm:text-right">
            <span class="text-[0.6875rem] font-semibold tracking-[0.18em] text-text uppercase">30 × 30 cm · linen cover · 40 pages</span>
            <span class="text-[0.6875rem] text-muted">Демонстрационный образец</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pb-hero {
  background:
    radial-gradient(55% 65% at 76% 48%, rgb(255 255 255 / 0.7), transparent 72%),
    var(--color-service-bg);
}

.hero-title {
  font-size: clamp(2.3rem, 1.5rem + 2.6vw, 3.5rem);
  line-height: 1.04;
  letter-spacing: -0.015em;
}

/* ---------- Scene ---------- */

.scene {
  perspective: 1700px;
}

/* Perspective must sit on the direct parent of the tilted element. */
.main {
  perspective: 1400px;
  perspective-origin: 50% 20%;
}

/* Soft warm daylight from the upper left — no bright gradients, just a lighter pool. */
.light {
  background:
    radial-gradient(48% 42% at 52% 62%, rgb(255 251 244 / 0.95), transparent 70%),
    radial-gradient(40% 40% at 20% 15%, rgb(255 255 255 / 0.5), transparent 70%);
}

.closed {
  transform: rotate(4deg);
}

/* A photographed volume already stands upright with its own light: no extra tilt. */
.closed.is-photo {
  transform: none;
}

.print {
  border-radius: 2px;
}

/* The open book: lies on the table (rotateX), turned slightly towards the reader (rotateZ). */
.main-tilt {
  transform: rotateX(var(--rx, 33deg)) rotateZ(var(--rz, -6deg)) translateY(var(--lift, 0px));
  transform-origin: 50% 65%;
  transition: transform 900ms var(--ease-enter);
}

.main-shadow {
  left: 6%;
  right: 6%;
  bottom: 2%;
  height: 26%;
  background: radial-gradient(50% 50% at 50% 50%, rgb(41 39 36 / 0.26), transparent);
  transition:
    transform 900ms var(--ease-enter),
    opacity 900ms var(--ease-enter);
}

/* Hover (pointer devices): the book lifts a little and turns to the reader; its shadow softens and spreads. */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .main:hover .main-tilt {
    --rx: 27deg;
    --rz: -4deg;
    --lift: -8px;
  }

  .main:hover .main-shadow {
    transform: scale(1.06, 1.12);
    opacity: 0.75;
  }
}

/* ---------- Photo objects ---------- */

/* Cover colour variants: cross-fade between stacked cut-outs. */
.closed-photo {
  opacity: 0;
  transition: opacity var(--motion-slow) var(--ease-standard);
}

.closed-photo.is-active {
  opacity: 1;
}

.main-photo {
  transition: transform 900ms var(--ease-enter);
}

/* A cut-out carries its own contact shadow — the table shadow under it stays faint. */
.main.is-photo .main-shadow {
  opacity: 0.55;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .main.is-photo:hover .main-photo {
    transform: translateY(-6px) scale(1.01);
  }

  .main.is-photo:hover .main-shadow {
    opacity: 0.4;
  }
}

/* Page block thickness: fine page lines, a darker notch at the layflat spine. */
.block-edge {
  position: absolute;
  top: 100%;
  left: 0.3%;
  right: 0.3%;
  height: 6%;
  background:
    radial-gradient(1.4% 120% at 50% 0%, rgb(0 0 0 / 0.28), transparent),
    linear-gradient(180deg, rgb(0 0 0 / 0.04), rgb(0 0 0 / 0.12)),
    repeating-linear-gradient(180deg, #f7f3ec 0 1.5px, #d6cdbf 1.5px 3px);
  border-radius: 0 0 2px 2px;
}

.board-edge {
  position: absolute;
  top: 106%;
  left: -1.6%;
  right: -1.6%;
  height: 2.6%;
  background: linear-gradient(180deg, #b9a88d, #9c8b72);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 6px 14px -6px rgb(41 39 36 / 0.45);
}

/* ---------- Entrance (once, subtle) ---------- */

@media (prefers-reduced-motion: no-preference) {
  .main {
    animation: rise 1000ms var(--ease-enter) 120ms both;
  }

  .closed {
    animation: stand-up 1200ms var(--ease-enter) 280ms both;
  }

  .print,
  .print-photo {
    animation: settle 900ms var(--ease-enter) var(--delay) both;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
}

/* The closed book turns into place from a slightly more open angle. */
@keyframes stand-up {
  from {
    opacity: 0;
    transform: rotate(-3deg) translate(14px, 10px);
  }
}

@keyframes settle {
  from {
    opacity: 0;
    translate: 0 14px;
  }
}
</style>
