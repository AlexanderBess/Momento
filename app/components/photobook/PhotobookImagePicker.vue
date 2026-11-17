<script setup lang="ts">
import { Check } from '@lucide/vue'
import { findImage } from '~/config/photobook/library'

/**
 * Compact gallery of the active collection's demo library. Opens for a slot (or the printed cover),
 * filters by category, applies the choice and closes.
 */
const { config, library, pickerTarget, setImage } = usePhotobookStudio()

const open = computed({
  get: () => pickerTarget.value !== null,
  set: (value) => {
    if (!value) pickerTarget.value = null
  },
})

const category = ref<string>('all')
watch(open, (value) => {
  if (value) category.value = 'all'
})

const currentId = computed(() => {
  const target = pickerTarget.value
  if (!target) return undefined
  if (target.kind === 'cover') return config.value.coverImageId
  return config.value.spreads.find((s) => s.id === target.spreadId)?.images[target.slot]
})

const subtitle = computed(() => {
  const target = pickerTarget.value
  if (!target) return ''
  if (target.kind === 'cover') return 'Фото на обложке'
  const index = config.value.spreads.findIndex((s) => s.id === target.spreadId)
  return `Разворот ${index + 1} · фото ${target.slot + 1}`
})

const images = computed(() =>
  category.value === 'all' ? library.value.images : library.value.images.filter((i) => i.category === category.value),
)

function choose(id: string) {
  if (pickerTarget.value) setImage(pickerTarget.value, id)
  pickerTarget.value = null
}

const currentTitle = computed(() => findImage(currentId.value)?.title)
</script>

<template>
  <BaseDialog v-model:open="open" title="Выберите фото" size="lg">
    <p class="-mt-1 mb-4 text-sm text-muted">
      {{ subtitle }}<template v-if="currentTitle"> · сейчас: {{ currentTitle }}</template>
      <span class="block text-xs">Библиотека {{ library.label }} — демонстрационные иллюстрации.</span>
    </p>

    <div class="no-scrollbar -mx-5 mb-5 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Категории">
      <button
        type="button"
        class="chip shrink-0"
        :class="category === 'all' && 'is-selected'"
        :aria-pressed="category === 'all'"
        @click="category = 'all'"
      >
        Все
      </button>
      <button
        v-for="item in library.categories"
        :key="item.id"
        type="button"
        class="chip shrink-0"
        :class="category === item.id && 'is-selected'"
        :aria-pressed="category === item.id"
        @click="category = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5">
      <li v-for="image in images" :key="image.id">
        <button
          type="button"
          class="group/pick flex w-full flex-col gap-1.5 text-left"
          :aria-label="`${image.title}${image.id === currentId ? ' (выбрано)' : ''}`"
          :aria-current="image.id === currentId"
          @click="choose(image.id)"
        >
          <span
            class="relative block aspect-square w-full overflow-hidden rounded-[0.75rem] ring-1 transition-[box-shadow] duration-(--motion-normal)"
            :class="image.id === currentId ? 'ring-2 ring-accent' : 'ring-border group-hover/pick:ring-text/40'"
          >
            <span class="block size-full transition-transform duration-(--motion-slow) ease-standard group-hover/pick:scale-[1.04]">
              <PhotobookImage :image-id="image.id" sizes="160px" />
            </span>
            <span
              v-if="image.id === currentId"
              class="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-accent text-white"
              aria-hidden="true"
            >
              <Check class="size-3.5" :stroke-width="2.5" />
            </span>
          </span>
          <span class="truncate text-xs font-medium text-muted" aria-hidden="true">{{ image.title }}</span>
        </button>
      </li>
    </ul>
  </BaseDialog>
</template>
