<script setup lang="ts">
import { ArrowUpRight, Check } from '@lucide/vue'
import {
  photozoneCategoryLabels,
  photozoneCategoryNames,
  photozoneConcepts,
  photozonePricing,
  type PhotozoneCategory,
} from '~/config/photozones'

/*
 * «Коллекция MOMENTO» — the main commercial block. Filter chips (scroll horizontally on phones),
 * a two-column editorial grid with the second column set lower, one column on phones.
 * Each card opens the details dialog (PhotozoneDetailsDialog) via usePhotozoneOrder().openConcept.
 */
type Filter = 'all' | PhotozoneCategory

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  ...(Object.keys(photozoneCategoryLabels) as PhotozoneCategory[]).map((id) => ({ id, label: photozoneCategoryLabels[id] })),
]

const active = ref<Filter>('all')
const visible = computed(() =>
  active.value === 'all' ? photozoneConcepts : photozoneConcepts.filter((c) => c.categories.includes(active.value as PhotozoneCategory)),
)

const { openConcept, isInCart } = usePhotozoneOrder()
const { ready } = useCart()
</script>

<template>
  <section id="collection" class="section-y bg-bg" aria-labelledby="pz-collection-title">
    <div class="container-page">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div class="lg:col-span-7">
          <p v-reveal class="eyebrow">03 / Collection</p>
          <h2 id="pz-collection-title" v-reveal="60" class="mt-5 font-display text-h2">Коллекция MOMENTO</h2>
          <p v-reveal="100" class="mt-5 max-w-lg text-lead text-muted">
            Продуманные композиции для событий, которые хочется запомнить.
          </p>
        </div>
        <p v-reveal="140" class="max-w-sm text-[0.8125rem] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
          Сейчас в коллекции — концепции оформления: иллюстрации показывают идею, фото реальных проектов добавим позже.
          <template v-if="photozonePricing.isDemo">Цены — демонстрационные и будут уточнены.</template>
        </p>
      </div>

      <!-- ---------- Filters ---------- -->
      <div
        v-reveal="80"
        class="no-scrollbar -mx-(--gutter) mt-10 flex gap-2 overflow-x-auto px-(--gutter) pb-1 md:mt-14"
        role="group"
        aria-label="Фильтр по типу мероприятия"
      >
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="chip h-11 shrink-0 px-5 text-sm"
          :class="active === filter.id && 'is-selected'"
          :aria-pressed="active === filter.id"
          @click="active = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>
      <p class="sr-only" aria-live="polite">Показано концепций: {{ visible.length }}</p>

      <!-- ---------- Cards ---------- -->
      <TransitionGroup
        v-if="visible.length"
        tag="ul"
        name="pz-card"
        class="mt-10 grid gap-14 md:mt-12 md:grid-cols-2 md:gap-x-8 md:gap-y-16 lg:gap-x-12 md:[&>li:nth-child(even)]:pt-24"
      >
        <li v-for="concept in visible" :key="concept.id">
          <article class="group relative flex flex-col" :aria-labelledby="`pz-${concept.id}`">
            <div class="relative">
              <PhotozoneVisual :asset="concept.gallery[0]!" ratio="4 / 5" sizes="640px md:480px lg:560px" zoom-on-hover />
              <span
                v-if="ready && isInCart(concept.id)"
                class="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-text px-3 py-1.5 text-xs font-semibold text-bg"
              >
                <Check class="size-3.5" :stroke-width="2.5" aria-hidden="true" />
                В заявке
              </span>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <p class="eyebrow text-(--color-accent)">{{ photozoneCategoryNames[concept.category] }}</p>
              <span class="h-px w-8 bg-service-accent/40" aria-hidden="true" />
              <p class="eyebrow">Концепция</p>
            </div>
            <h3 :id="`pz-${concept.id}`" class="mt-3 font-display text-[clamp(1.875rem,1.5rem+1.4vw,2.5rem)] leading-tight">
              {{ concept.title }}
            </h3>
            <p class="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted">{{ concept.summary }}</p>

            <div class="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-border pt-5">
              <p class="flex flex-col">
                <span class="text-xs text-muted">Аренда под ключ</span>
                <span class="mt-1 text-lg font-semibold tabular-nums">
                  <template v-if="concept.basePrice !== null">от {{ formatRub(concept.basePrice) }}</template>
                  <template v-else>Стоимость обсуждается</template>
                </span>
                <span v-if="concept.basePrice !== null && photozonePricing.isDemo" class="text-xs text-muted">демо-цена</span>
              </p>
              <!-- The button's ::after covers the whole card: one tab stop, the whole card is clickable. -->
              <button
                type="button"
                class="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-(--color-accent) underline-offset-[6px] after:absolute after:inset-0 after:rounded-card hover:underline"
                :aria-label="`Подробнее о фотозоне «${concept.title}»`"
                @click="openConcept(concept.id)"
              >
                Подробнее
                <ArrowUpRight
                  class="size-4 transition-transform duration-(--motion-normal) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  :stroke-width="2"
                  aria-hidden="true"
                />
              </button>
            </div>
          </article>
        </li>
      </TransitionGroup>

      <div v-else class="mt-12 rounded-card border border-dashed border-border px-6 py-12 text-center">
        <p class="font-display text-h3">Скоро здесь появятся новые концепции</p>
        <p class="mt-3 text-muted">А пока можно обсудить индивидуальный проект.</p>
        <BaseButton to="#custom" variant="secondary" class="mt-6">Индивидуальный проект</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pz-card-enter-active {
  transition:
    opacity var(--motion-slow) var(--ease-enter),
    transform var(--motion-slow) var(--ease-enter);
}

.pz-card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
