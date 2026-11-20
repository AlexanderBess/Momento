<script setup lang="ts">
import { findCoverColor } from '~/config/photobook/covers'
import { findFormat, plural } from '~/config/photobook/formats'
import { findLayout } from '~/config/photobook/layouts'
import { extraOptions, findEndpaper, findPaperType } from '~/config/photobook/materials'
import { effectiveExtras } from '~/lib/photobook'
import type { PreviewView } from '~/types/photobook'

/**
 * MOMENTO Book Studio: settings on the left, the live preview on the right (sticky).
 * On phones the preview comes first and stays pinned under the header, settings scroll below it,
 * and the price + order actions live in a bottom bar.
 *
 * The open book is a Book Studio project: autosaved on this device and version-checked
 * (useBookStudioSession). It joins «Моя подборка» only via «Добавить в заказ» / «Оформить заказ».
 */
const { config, cover, preset, activeSpread, focusView } = usePhotobookStudio()
useBookStudioSession()

/* ---------- Groups ---------- */

type GroupId = 'format' | 'cover' | 'paper' | 'extras' | 'spreads'
const groupView: Record<GroupId, PreviewView> = {
  format: 'cover',
  cover: 'cover',
  paper: 'spread',
  extras: 'cover',
  spreads: 'spread',
}

const openGroups = reactive<Record<GroupId, boolean>>({
  format: true,
  cover: false,
  paper: false,
  extras: false,
  spreads: false,
})

/** Opening a group shows the part of the book it changes. */
function toggle(id: GroupId, value: boolean) {
  openGroups[id] = value
  if (value) focusView(groupView[id])
}

const summaries = computed(() => {
  const c = config.value
  const format = findFormat(c.format)
  const extras = effectiveExtras(c)
  const extrasCount = extraOptions.filter((e) => extras[e.id]).length
  return {
    format: `${format.label} ${format.widthCm}×${format.heightCm} · ${c.pageCount} ${plural(c.pageCount, ['страница', 'страницы', 'страниц'])}`,
    cover: `${cover.value.label} · ${findCoverColor(c.coverType, c.coverColor).label.toLowerCase()}`,
    paper: `${findPaperType(c.paperType).label} бумага`,
    extras: `Форзац ${findEndpaper(c.endpaperColor).label.toLowerCase()}${extrasCount ? ` · +${extrasCount}` : ''}`,
    spreads: activeSpread.value
      ? `Разворот ${c.spreads.indexOf(activeSpread.value) + 1} · ${findLayout(activeSpread.value.layout).label}`
      : `${c.spreads.length} ${plural(c.spreads.length, ['разворот', 'разворота', 'разворотов'])}`,
  }
})

/* ---------- Mobile order bar: visible inside the studio until the full price panel is on screen ---------- */

const section = useTemplateRef<HTMLElement>('section')
const pricePanel = useTemplateRef<HTMLElement>('pricePanel')
const { isInView: studioInView } = useInView(section)
const { isInView: panelInView } = useInView(pricePanel)
const showBar = computed(() => studioInView.value && !panelInView.value)
</script>

<template>
  <section id="studio" ref="section" class="section-y" aria-labelledby="studio-title">
    <div class="container-page">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          v-reveal
          eyebrow="MOMENTO Book Studio"
          title="Соберите свою книгу"
          heading-id="studio-title"
          lead="Каждое изменение сразу видно на книге справа: формат, обложка, бумага и вёрстка каждого разворота."
        />
        <p v-reveal="80" class="flex shrink-0 items-center gap-2 text-sm text-muted">
          Коллекция
          <span class="rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">{{ preset.name }}</span>
          <a href="#collections" class="font-semibold text-text underline-offset-4 hover:underline">Сменить</a>
        </p>
      </div>

      <PhotobookProjectBar class="mt-8 lg:mt-10" />

      <div class="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,22.5rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-14">
        <!-- ---------- Preview (first on phones, right column on desktop) ---------- -->
        <div class="preview-pin lg:order-2">
          <div class="lg:sticky lg:top-[calc(var(--header-height)+1.25rem)]">
            <PhotobookPreview />
          </div>
        </div>

        <!-- ---------- Settings ---------- -->
        <div class="lg:order-1">
          <div class="rounded-modal bg-surface/70 px-5 ring-1 ring-border sm:px-6">
            <StudioGroup :index="1" title="Формат и объём" :summary="summaries.format" :open="openGroups.format" @update:open="toggle('format', $event)">
              <PhotobookFormatSelector />
              <PhotobookPageSelector />
            </StudioGroup>
            <StudioGroup :index="2" title="Обложка" :summary="summaries.cover" :open="openGroups.cover" @update:open="toggle('cover', $event)">
              <PhotobookCoverSelector />
            </StudioGroup>
            <StudioGroup :index="3" title="Бумага" :summary="summaries.paper" :open="openGroups.paper" @update:open="toggle('paper', $event)">
              <PhotobookMaterialSelector />
            </StudioGroup>
            <StudioGroup :index="4" title="Дополнительно" :summary="summaries.extras" :open="openGroups.extras" @update:open="toggle('extras', $event)">
              <PhotobookExtrasSelector />
            </StudioGroup>
            <StudioGroup :index="5" title="Развороты и фото" :summary="summaries.spreads" :open="openGroups.spreads" @update:open="toggle('spreads', $event)">
              <PhotobookLayoutSelector />
            </StudioGroup>
          </div>

          <div ref="pricePanel" class="mt-6">
            <PhotobookPriceSummary />
          </div>
          <p class="mt-4 text-xs leading-relaxed text-muted lg:hidden">
            Иллюстрации в конструкторе — демонстрационные. В вашей книге будут ваши фотографии.
          </p>
        </div>
      </div>
    </div>

    <!-- ---------- Mobile order bar ---------- -->
    <Transition name="bar">
      <div
        v-if="showBar"
        class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 px-(--gutter) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-24px_rgb(41_39_36/0.5)] backdrop-blur-sm lg:hidden"
      >
        <PhotobookPriceSummary variant="bar" />
      </div>
    </Transition>

    <PhotobookImagePicker />
    <PhotobookConflictDialog />
  </section>
</template>

<style scoped>
/* Phones and tablets: the preview stays pinned under the header while the settings scroll. */
@media (max-width: 1023.98px) {
  .preview-pin {
    position: sticky;
    top: var(--header-height);
    z-index: 20;
    margin-inline: calc(var(--gutter) * -1);
    padding: 0.5rem var(--gutter) 0.75rem;
    background-color: var(--color-bg);
    box-shadow: 0 12px 20px -18px rgb(41 39 36 / 0.35);
  }
}

.bar-enter-active,
.bar-leave-active {
  transition:
    transform var(--motion-slow) var(--ease-enter),
    opacity var(--motion-normal) var(--ease-standard);
}

.bar-enter-from,
.bar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
