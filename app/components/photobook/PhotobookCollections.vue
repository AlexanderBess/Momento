<script setup lang="ts">
import { ArrowRight, Check } from '@lucide/vue'
import { findCoverType } from '~/config/photobook/covers'
import { findFormat } from '~/config/photobook/formats'
import { findPaperType } from '~/config/photobook/materials'
import { photobookPresets } from '~/config/photobook/presets'
import { createConfig } from '~/lib/photobook'
import type { PresetId } from '~/types/photobook'

/**
 * Ready-made collections. Each card previews the preset's real configuration (cover + first spread),
 * «Использовать шаблон» loads it into the studio and scrolls there.
 */
const { config, applyPreset } = usePhotobookStudio()

const cards = photobookPresets.map((preset) => {
  const book = createConfig(preset.id)
  const format = findFormat(preset.format)
  const showcase = book.spreads.find((s) => s.layout !== 'minimal') ?? book.spreads[0]!
  return {
    preset,
    book,
    showcase,
    specs: [`${format.widthCm}×${format.heightCm} см`, findCoverType(preset.coverType).label, findPaperType(preset.paperType).label],
  }
})

function use(id: PresetId) {
  // The active collection is only reopened — re-applying it would discard the visitor's edits.
  if (config.value.selectedCollection !== id) applyPreset(id)
  const studio = document.getElementById('studio')
  studio?.scrollIntoView({ block: 'start' })
  // Move focus for keyboard and screen reader users without a second jump.
  document.getElementById('studio-title')?.setAttribute('tabindex', '-1')
  document.getElementById('studio-title')?.focus({ preventScroll: true })
}
</script>

<template>
  <section id="collections" class="section-y bg-surface" aria-labelledby="collections-title">
    <div class="container-page">
      <SectionHeading
        v-reveal
        eyebrow="Коллекции"
        title="Начните с готовой истории"
        heading-id="collections-title"
        lead="Четыре настроенные концепции — с обложкой, бумагой и ритмом разворотов. Любой параметр потом можно изменить."
      />

      <ul class="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 xl:grid-cols-4">
        <li v-for="(card, index) in cards" :key="card.preset.id" v-reveal="index * 90">
          <article
            class="group flex h-full flex-col overflow-hidden rounded-card bg-bg ring-1 transition-[box-shadow,translate] duration-(--motion-slow) ease-enter hover:-translate-y-1 hover:shadow-(--shadow-raised)"
            :class="config.selectedCollection === card.preset.id ? 'ring-accent/60' : 'ring-border'"
          >
            <!-- Preview: the preset's own cover and a spread from it -->
            <div class="relative aspect-[5/4] overflow-hidden bg-[radial-gradient(80%_80%_at_40%_35%,#fff,#e9e2d7)]" aria-hidden="true">
              <div class="absolute inset-y-[6%] left-[4%] w-[66%] transition-transform duration-(--motion-slow) ease-enter group-hover:-translate-y-1">
                <PhotobookCover :config="card.book" :fit="[0.8, 0.84]" sizes="200px" />
              </div>
              <div
                class="absolute right-[5%] bottom-[8%] w-[56%] rotate-3 rounded-[3px] bg-surface p-[1.5%] shadow-(--shadow-raised) transition-transform duration-(--motion-slow) ease-enter group-hover:rotate-1"
              >
                <div class="relative" :style="{ aspectRatio: `${findFormat(card.preset.format).widthCm * 2} / ${findFormat(card.preset.format).heightCm}` }">
                  <SpreadArtwork :spread="card.showcase" :paper-type="card.preset.paperType" sizes="200px" />
                  <span class="absolute inset-y-0 left-1/2 w-px bg-black/15" />
                </div>
              </div>
            </div>

            <div class="flex flex-1 flex-col gap-3 p-5">
              <p class="eyebrow">{{ card.preset.theme }}</p>
              <h3 class="font-display text-h3">{{ card.preset.name }}</h3>
              <p class="text-sm leading-relaxed text-muted">{{ card.preset.description }}</p>
              <ul class="mt-1 flex flex-wrap gap-1.5" aria-label="Параметры">
                <li v-for="spec in card.specs" :key="spec" class="rounded-full bg-surface-muted px-2.5 py-1 text-[0.6875rem] font-semibold text-text">
                  {{ spec }}
                </li>
              </ul>
              <div class="mt-auto pt-3">
                <BaseButton
                  :variant="config.selectedCollection === card.preset.id ? 'secondary' : 'primary'"
                  block
                  :aria-label="`Использовать шаблон ${card.preset.name}`"
                  @click="use(card.preset.id)"
                >
                  <Check v-if="config.selectedCollection === card.preset.id" class="size-4 text-accent" :stroke-width="2" aria-hidden="true" />
                  {{ config.selectedCollection === card.preset.id ? 'Выбран — открыть' : 'Использовать шаблон' }}
                  <template v-if="config.selectedCollection !== card.preset.id" #icon>
                    <ArrowRight class="size-4" :stroke-width="2" />
                  </template>
                </BaseButton>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>
