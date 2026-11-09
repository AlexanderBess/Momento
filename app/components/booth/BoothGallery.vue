<script setup lang="ts">
import { boothGallery, GALLERY_PAGE_SIZE, galleryCategoryLabels, type GalleryCategory } from '~/config/booth'

type Filter = GalleryCategory | 'all'

const filter = ref<Filter>('all')
const limit = ref(GALLERY_PAGE_SIZE)

const categories = (Object.keys(galleryCategoryLabels) as GalleryCategory[]).filter((c) =>
  boothGallery.some((item) => item.category === c),
)

const filtered = computed(() =>
  filter.value === 'all' ? boothGallery : boothGallery.filter((item) => item.category === filter.value),
)
// Images are rendered in pages — the rest is loaded only on request.
const visible = computed(() => filtered.value.slice(0, limit.value))
const hasMore = computed(() => filtered.value.length > limit.value)

function select(next: Filter) {
  filter.value = next
  limit.value = GALLERY_PAGE_SIZE
}
</script>

<template>
  <section id="gallery" class="section-y" aria-labelledby="gallery-title">
    <div class="container-page">
      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          v-reveal
          eyebrow="Галерея образов"
          title="Каждый гость — в новой роли"
          heading-id="gallery-title"
          lead="Направления, в которых можно работать. Конкретные образы подбираем под ваше мероприятие."
        />
      </div>

      <!-- Filters: horizontal scroll on narrow screens instead of wrapping into many rows. -->
      <div
        v-reveal="80"
        class="no-scrollbar -mx-(--gutter) mt-8 flex gap-2 overflow-x-auto px-(--gutter) pb-1 md:mt-10"
        role="group"
        aria-label="Категории образов"
      >
        <button
          v-for="option in (['all', ...categories] as Filter[])"
          :key="option"
          type="button"
          class="inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-semibold transition-[background-color,border-color,color] duration-(--motion-normal) ease-standard"
          :class="option === filter ? 'border-text bg-text text-bg' : 'border-border bg-surface text-text hover:border-text/40'"
          :aria-pressed="option === filter"
          @click="select(option)"
        >
          {{ option === 'all' ? 'Все' : galleryCategoryLabels[option] }}
        </button>
      </div>

      <!-- Masonry via CSS columns; crossfade when the category changes. -->
      <Transition name="gallery-fade" mode="out-in">
        <ul :key="filter" class="mt-8 columns-2 gap-3 sm:gap-4 md:mt-10 lg:columns-3 lg:gap-5" aria-live="polite">
          <li
            v-for="(item, index) in visible"
            :key="item.id"
            v-reveal="(index % 3) * 90"
            class="mb-3 break-inside-avoid sm:mb-4 lg:mb-5"
          >
            <figure class="group relative">
              <PhotoFrame
                :image="item.image"
                zoom-on-hover
                sizes="(min-width: 1024px) 380px, 50vw"
              />
              <figcaption
                class="absolute bottom-3 left-3 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-text shadow-(--shadow-soft)"
              >
                {{ galleryCategoryLabels[item.category] }}
              </figcaption>
            </figure>
          </li>
        </ul>
      </Transition>

      <div v-if="hasMore" class="mt-8 flex justify-center">
        <BaseButton variant="secondary" @click="limit += GALLERY_PAGE_SIZE">Показать ещё</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity var(--motion-normal) var(--ease-standard);
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}
</style>
