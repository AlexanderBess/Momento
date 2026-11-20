<script setup lang="ts">
import { BookOpen, Check, Plus } from '@lucide/vue'
import { findPreset } from '~/config/photobook/presets'
import type { PhotobookProject } from '~/lib/photobookProjects'
import { photobookKey } from '~/lib/selection'

/**
 * Which book is open in the studio, its save state, and «Мои книги»: every Book Studio project on
 * this device (kept independently of «Моя подборка» — removing a book from the selection keeps
 * its project here).
 */
const project = usePhotobookProject()
const { config } = usePhotobookStudio()
const cart = useCart()

const listOpen = ref(false)
const projects = ref<PhotobookProject[]>([])

const name = (c: PhotobookProject['config']) =>
  c.coverTitleEnabled && c.coverTitle.trim() ? `«${c.coverTitle.trim()}»` : `Книга · ${findPreset(c.selectedCollection).name}`

const status = computed(() => {
  if (project.conflict.value) return 'Есть более новая версия'
  if (project.saveStatus.value === 'failed') return 'Не удалось сохранить на этом устройстве'
  if (project.dirty.value) return project.saveStatus.value === 'idle' ? 'Не сохранена' : 'Сохраняется…'
  return project.saveStatus.value === 'saved' ? 'Сохранена на этом устройстве' : 'Новая книга'
})

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

function openList() {
  project.save()
  projects.value = project.listProjects()
  listOpen.value = true
}

function choose(id: string) {
  project.open(id)
  listOpen.value = false
}

function createNew() {
  project.createNew()
  listOpen.value = false
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-card bg-surface px-4 py-3 ring-1 ring-border">
    <p class="flex min-w-0 items-center gap-3 text-sm">
      <BookOpen class="size-4 shrink-0 text-accent" :stroke-width="1.75" aria-hidden="true" />
      <span class="min-w-0">
        <span class="block truncate font-semibold">{{ name(config) }}</span>
        <span class="block text-xs text-muted" role="status">
          {{ status }}<template v-if="project.inSelection.value"> · в подборке</template>
        </span>
      </span>
    </p>
    <div class="flex items-center gap-1">
      <button type="button" class="min-h-11 rounded-button px-3 text-sm font-semibold hover:bg-text/5" @click="openList">Мои книги</button>
      <button type="button" class="inline-flex min-h-11 items-center gap-1.5 rounded-button px-3 text-sm font-semibold hover:bg-text/5" @click="createNew">
        <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
        Новая книга
      </button>
    </div>

    <BaseDialog v-model:open="listOpen" title="Мои книги" size="sm">
      <p class="text-sm text-muted">
        Книги сохраняются в этом браузере и не удаляются вместе с подборкой. В подборку книга попадает только по кнопке
        «Добавить в заказ».
      </p>
      <ul v-if="projects.length" class="mt-5 grid gap-2">
        <li v-for="p in projects" :key="p.id">
          <button
            type="button"
            class="option-card flex w-full items-center gap-3 px-4 py-3 text-left"
            :class="p.id === project.projectId.value && 'is-selected'"
            :aria-current="p.id === project.projectId.value ? 'true' : undefined"
            @click="choose(p.id)"
          >
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-sm font-semibold">{{ name(p.config) }}</span>
              <span class="text-xs text-muted">Изменена {{ dateFormat.format(p.updatedAt) }}</span>
            </span>
            <span v-if="cart.has(photobookKey(p.id))" class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
              <Check class="size-3.5" :stroke-width="2.5" aria-hidden="true" />
              в подборке
            </span>
          </button>
        </li>
      </ul>
      <p v-else class="mt-5 text-sm">Сохранённых книг пока нет — книга сохраняется после первого изменения.</p>
      <template #footer>
        <BaseButton variant="secondary" block @click="createNew">
          <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
          Новая книга
        </BaseButton>
      </template>
    </BaseDialog>
  </div>
</template>
