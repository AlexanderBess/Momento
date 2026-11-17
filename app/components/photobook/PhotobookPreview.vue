<script setup lang="ts">
import { BookOpen, ChevronLeft, ChevronRight, LayoutGrid, Library } from '@lucide/vue'
import type { Component } from 'vue'
import { ENDPAPER_ID } from '~/lib/photobook'
import type { PreviewView } from '~/types/photobook'

/**
 * The live preview of the studio: closed book, open spread with page turns, or all spreads.
 * Reads the shared studio state only; every setting re-renders just the parts that use it.
 */
const { config, spreadIndex, sequenceIndex, pageSequence, focusView, step, pickerTarget, coverPose } =
  usePhotobookStudio()

const views: { id: PreviewView; label: string; icon: Component }[] = [
  { id: 'cover', label: 'Обложка', icon: Library },
  { id: 'spread', label: 'Разворот', icon: BookOpen },
  { id: 'thumbnails', label: 'Все развороты', icon: LayoutGrid },
]

const onEndpaper = computed(() => config.value.activeSpreadId === ENDPAPER_ID)
const spreadLabel = computed(() =>
  onEndpaper.value
    ? 'Форзац'
    : `Разворот ${spreadIndex.value + 1} из ${config.value.spreads.length} · стр. ${spreadIndex.value * 2 + 1}–${spreadIndex.value * 2 + 2}`,
)

function replace(spreadId: string, slot: number) {
  pickerTarget.value = { kind: 'slot', spreadId, slot }
}

/** ← / → turn pages while the open book has focus. */
function onKeydown(event: KeyboardEvent) {
  if (config.value.activeView !== 'spread') return
  if (event.key === 'ArrowRight') step(1)
  else if (event.key === 'ArrowLeft') step(-1)
  else return
  event.preventDefault()
}

/* Swipe to turn pages on touch screens. */
let touchX: number | null = null
function onTouchStart(event: TouchEvent) {
  touchX = event.touches.length === 1 ? event.touches[0]!.clientX : null
}
function onTouchEnd(event: TouchEvent) {
  if (touchX === null || config.value.activeView !== 'spread') return
  const dx = event.changedTouches[0]!.clientX - touchX
  touchX = null
  if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1)
}
</script>

<template>
  <!-- Phones: view switch → stage → context (pose / spread number); from `sm` the context sits next to the switch. -->
  <div class="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
      <div class="inline-flex justify-self-start rounded-button bg-surface-muted p-1" role="group" aria-label="Режим просмотра">
        <button
          v-for="view in views"
          :key="view.id"
          type="button"
          class="segment gap-1.5 px-3"
          :class="config.activeView === view.id && 'is-selected'"
          :aria-pressed="config.activeView === view.id"
          @click="focusView(view.id)"
        >
          <component :is="view.icon" class="size-4" :stroke-width="1.75" aria-hidden="true" />
          <span :class="view.id === 'thumbnails' && 'max-sm:sr-only'">{{ view.label }}</span>
        </button>
      </div>

      <div
        v-if="config.activeView === 'cover'"
        class="inline-flex justify-self-center rounded-button bg-surface-muted p-1 max-sm:order-last sm:justify-self-end"
        role="group"
        aria-label="Ракурс"
      >
        <button
          type="button"
          class="segment px-3"
          :class="coverPose === 'three-quarter' && 'is-selected'"
          :aria-pressed="coverPose === 'three-quarter'"
          @click="coverPose = 'three-quarter'"
        >
          Лицевая
        </button>
        <button
          type="button"
          class="segment px-3"
          :class="coverPose === 'spine' && 'is-selected'"
          :aria-pressed="coverPose === 'spine'"
          @click="coverPose = 'spine'"
        >
          Корешок
        </button>
      </div>
      <p
        v-else-if="config.activeView === 'spread'"
        class="text-center text-xs font-semibold text-muted tabular-nums max-sm:order-last sm:text-right"
        aria-live="polite"
      >
        {{ spreadLabel }}
      </p>

    <!-- Stage -->
    <div
      class="stage relative overflow-hidden rounded-modal sm:col-span-2"
      :class="config.activeView === 'thumbnails' && 'is-scroll'"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <Transition name="view" mode="out-in">
        <div v-if="config.activeView === 'cover'" key="cover" class="absolute inset-0">
          <PhotobookCover :config="config" :pose="coverPose" tilt :fit="[0.56, 0.74]" sizes="450px lg:420px" />
        </div>

        <div
          v-else-if="config.activeView === 'spread'"
          key="spread"
          class="absolute inset-0 px-3 sm:px-14"
          tabindex="0"
          role="group"
          aria-roledescription="разворот книги"
          :aria-label="`${spreadLabel}. Стрелки влево и вправо перелистывают страницы`"
          @keydown="onKeydown"
        >
          <PhotobookSpread
            :config="config"
            :spread-id="config.activeSpreadId"
            interactive
            sizes="320px lg:380px"
            @replace="replace"
          />
        </div>

        <div v-else key="thumbnails" class="absolute inset-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <PhotobookThumbnails variant="grid" />
        </div>
      </Transition>

      <!-- Page turn controls -->
      <template v-if="config.activeView === 'spread'">
        <button
          type="button"
          class="turn-button left-2 sm:left-3"
          :disabled="sequenceIndex <= 0"
          aria-label="Предыдущий разворот"
          @click="step(-1)"
        >
          <ChevronLeft class="size-5" :stroke-width="1.75" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="turn-button right-2 sm:right-3"
          :disabled="sequenceIndex >= pageSequence.length - 1"
          aria-label="Следующий разворот"
          @click="step(1)"
        >
          <ChevronRight class="size-5" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </template>
    </div>

    <!-- Phones: the preview is pinned, so it stays compact — spreads are reachable via arrows, swipe and «Все развороты». -->
    <PhotobookThumbnails v-if="config.activeView === 'spread'" variant="strip" class="max-lg:hidden sm:col-span-2" />

    <p class="text-xs leading-relaxed text-muted max-lg:hidden sm:col-span-2">
      Иллюстрации в конструкторе — демонстрационные. В вашей книге будут ваши фотографии.
    </p>
  </div>
</template>

<style scoped>
.stage {
  height: clamp(13.5rem, 56vw, 22rem);
  background:
    radial-gradient(70% 60% at 50% 42%, rgb(255 255 255 / 0.9), transparent 70%),
    linear-gradient(180deg, #efeae2, #e6dfd4);
  box-shadow: inset 0 0 0 1px rgb(41 39 36 / 0.06);
}

@media (min-width: 1024px) {
  .stage {
    height: clamp(26rem, 58vh, 36rem);
  }
}

.turn-button {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: rgb(255 255 255 / 0.9);
  color: var(--color-text);
  box-shadow: var(--shadow-soft);
  transition:
    background-color var(--motion-normal) var(--ease-standard),
    opacity var(--motion-normal) var(--ease-standard),
    scale var(--motion-fast) var(--ease-standard);
}

.turn-button:hover:not(:disabled) {
  background-color: var(--color-surface);
}

.turn-button:active:not(:disabled) {
  scale: 0.95;
}

.turn-button:disabled {
  opacity: 0;
  pointer-events: none;
}

.view-enter-active,
.view-leave-active {
  transition:
    opacity 320ms var(--ease-standard),
    transform 420ms var(--ease-enter);
}

.view-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.985);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
