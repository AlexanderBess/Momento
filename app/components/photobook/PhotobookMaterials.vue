<script setup lang="ts">
import { coverTypes } from '~/config/photobook/covers'
import { paperTypes } from '~/config/photobook/materials'
import { createConfig } from '~/lib/photobook'

/**
 * Materials & quality — an editorial spread of the materials offered in the studio.
 * Surfaces are rendered with the same textures as the configurator (labelled as visualisations)
 * until real macro photos of the samples exist (see docs/IMAGES.md). Descriptions describe the look
 * only — no unconfirmed claims about durability or production.
 */
const fabric = coverTypes.find((t) => t.id === 'fabric')!
const leather = coverTypes.find((t) => t.id === 'leatherette')!

const examples = [createConfig('travelJournal'), createConfig('familyMoments')].map((book) => ({
  book,
  spread: book.spreads.find((s) => s.layout === 'collage' || s.layout === 'editorial') ?? book.spreads[0]!,
}))
</script>

<template>
  <section class="section-y clip-x" aria-labelledby="materials-title">
    <div class="container-page">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
        <SectionHeading v-reveal eyebrow="Материалы" title="То, что чувствуется в руках" heading-id="materials-title" />
        <p v-reveal="80" class="max-w-md text-lead text-muted lg:justify-self-end">
          Фотокнига — это не только снимки, но и фактура обложки, вес страниц и то, как книга раскрывается.
        </p>
      </div>

      <div class="mt-12 grid gap-4 md:grid-cols-6 lg:mt-16 lg:gap-5">
        <!-- Fabric: fanned swatch cards -->
        <figure v-reveal class="tile md:col-span-4 md:row-span-2">
          <div class="relative aspect-[4/3] overflow-hidden rounded-card bg-[#ebe5dc] md:aspect-auto md:h-full md:min-h-[26rem]">
            <div class="absolute inset-0 flex items-center justify-center">
              <span
                v-for="(color, i) in fabric.colors"
                :key="color.id"
                class="fan absolute h-[62%] w-[34%] overflow-hidden rounded-[6px] shadow-(--shadow-raised)"
                :style="{ '--i': i - (fabric.colors.length - 1) / 2 }"
              >
                <MaterialSurface surface="linen" :color="color.hex" lit />
              </span>
            </div>
            <span class="tag">Визуализация</span>
          </div>
          <figcaption class="caption">
            <span class="font-semibold text-text">Тканевые обложки.</span>
            Переплётная ткань с мягкой фактурой — {{ fabric.colors.length }} спокойных оттенков от молочного до графитового.
          </figcaption>
        </figure>

        <!-- Leatherette -->
        <figure v-reveal="80" class="tile md:col-span-2">
          <div class="relative aspect-[4/3] overflow-hidden rounded-card">
            <div class="absolute inset-0 grid grid-cols-2">
              <span v-for="color in leather.colors" :key="color.id" class="relative">
                <MaterialSurface surface="grain" :color="color.hex" lit />
              </span>
            </div>
            <span class="tag">Визуализация</span>
          </div>
          <figcaption class="caption"><span class="font-semibold text-text">Кожзам.</span> Зернистая фактура и сдержанный блеск.</figcaption>
        </figure>

        <!-- Papers -->
        <figure v-reveal="120" class="tile md:col-span-2">
          <div class="relative aspect-[4/3] overflow-hidden rounded-card bg-[#e4ddd2]">
            <span
              v-for="(paper, i) in paperTypes"
              :key="paper.id"
              class="sheet absolute top-[14%] h-[72%] w-[40%] overflow-hidden rounded-[3px] shadow-(--shadow-soft)"
              :style="{ left: `${6 + i * 27}%`, rotate: `${(i - 1) * 4}deg` }"
            >
              <MaterialSurface :surface="paper.surface" :color="paper.tone" />
              <span class="absolute bottom-2 left-2.5 text-[0.625rem] font-semibold tracking-[0.12em] text-muted uppercase">{{ paper.label }}</span>
            </span>
            <span class="tag">Визуализация</span>
          </div>
          <figcaption class="caption">
            <span class="font-semibold text-text">Бумага страниц.</span> Матовая, глянцевая или фактурная — под характер снимков.
          </figcaption>
        </figure>

        <!-- Example spreads -->
        <figure v-for="(example, i) in examples" :key="i" v-reveal="i * 80" class="tile md:col-span-3">
          <div class="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-card bg-[radial-gradient(70%_80%_at_50%_45%,#fff,#e8e1d6)]">
            <div class="absolute inset-[7%]">
              <PhotobookSpread :config="example.book" :spread-id="example.spread.id" :fit="[0.96, 0.9]" sizes="290px md:280px" />
            </div>
            <span class="tag">Визуализация</span>
          </div>
          <figcaption class="caption">
            <span class="font-semibold text-text">{{ i === 0 ? 'Разворот Travel Journal.' : 'Разворот Family Moments.' }}</span>
            {{ i === 0 ? 'Коллаж из дороги: шесть кадров в одном ритме.' : 'Крупный снимок и две детали — editorial-сетка.' }}
          </figcaption>
        </figure>
      </div>

      <p v-reveal class="mt-8 max-w-2xl text-sm text-muted">
        Переплёт и окончательный список материалов согласуем при обсуждении макета — с учётом формата и количества
        страниц. Фотографии образцов появятся здесь в ближайшее время.
      </p>
    </div>
  </section>
</template>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.caption {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--color-muted);
}

.tag {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  border-radius: 999px;
  background-color: rgb(255 255 255 / 0.85);
  padding: 0.25rem 0.625rem;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.fan {
  transform: translateX(calc(var(--i) * 24%)) rotate(calc(var(--i) * 7deg)) translateY(calc(var(--i) * var(--i) * 1.5%));
  transform-origin: 50% 120%;
  transition: transform 700ms var(--ease-enter);
}

@media (hover: hover) {
  .tile:hover .fan {
    transform: translateX(calc(var(--i) * 30%)) rotate(calc(var(--i) * 9deg)) translateY(calc(var(--i) * var(--i) * 2%));
  }
}
</style>
