<script setup lang="ts">
import { AlertCircle, ArrowUpRight } from '@lucide/vue'
import type { CartItem } from '~/types/cart'
import { sameJson } from '~/lib/ids'
import {
  conflictingFields,
  mergeStates,
  readProject,
  saveProject,
  type PhotobookProject,
  type ProjectState,
} from '~/lib/photobookProjects'
import {
  boothItem,
  photographyItem,
  photozoneItem,
  readBoothConfig,
  readPhotobookItemConfig,
  readPhotographyConfig,
  readPhotozoneConfig,
  type BoothConfig,
  type PhotographyConfig,
  type PhotozoneConfig,
} from '~/lib/selection'

/**
 * Editor of one selection position: a shared modal shell (BaseDialog over the drawer / checkout)
 * with the service's own form inside. Works on a copy — the position changes only on «Сохранить».
 * Closing with unsaved changes asks «Сохранить изменения» / «Выйти без сохранения».
 *
 * Photobooks edit the Book Studio project itself (version-checked); the position is then synced.
 */
type Draft =
  | { kind: 'booth'; value: BoothConfig }
  | { kind: 'photography'; value: PhotographyConfig }
  | { kind: 'photozones'; value: PhotozoneConfig }
  | { kind: 'photobooks'; value: ProjectState; projectId: string; baseVersion: number; base: ProjectState }
  | { kind: 'missing' }

const cart = useCart()
const { editingId, announce } = useSelection()
const confirm = useConfirm()

const item = computed(() => (editingId.value ? cart.findById(editingId.value) : undefined))
const draft = ref<Draft | null>(null)
const initial = ref<unknown>(null)
const conflict = ref<{ latest: PhotobookProject; fields: string[] } | null>(null)
const saveError = ref(false)

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function draftFor(it: CartItem): Draft {
  switch (it.service) {
    case 'booth':
      return { kind: 'booth', value: readBoothConfig(it.config) }
    case 'photography':
      return { kind: 'photography', value: readPhotographyConfig(it.config) }
    case 'photozones': {
      const value = readPhotozoneConfig(it.config)
      return value ? { kind: 'photozones', value } : { kind: 'missing' }
    }
    case 'photobooks': {
      const link = readPhotobookItemConfig(it.config)
      const project = link ? readProject(link.projectId) : null
      if (!project) return { kind: 'missing' }
      const state = { config: project.config, layoutComplete: project.layoutComplete }
      return { kind: 'photobooks', value: clone(state), projectId: project.id, baseVersion: project.version, base: clone(state) }
    }
  }
}

// Fresh copy each time a position is opened (an id change or the editor re-opened).
watch(
  editingId,
  () => {
    conflict.value = null
    saveError.value = false
    if (!item.value) {
      draft.value = null
      return
    }
    draft.value = draftFor(item.value)
    initial.value = clone('value' in draft.value ? draft.value.value : null)
  },
  { immediate: true },
)

// The position disappeared (removed in another tab) → close.
watch(item, (value) => {
  if (!value && editingId.value) editingId.value = null
})

const dirty = computed(() => Boolean(draft.value && 'value' in draft.value && !sameJson(draft.value.value, initial.value)))

const open = computed({
  get: () => Boolean(item.value),
  set: (value) => {
    if (!value) editingId.value = null
  },
})

const title = computed(() => (item.value ? `Изменить: ${item.value.title}` : 'Изменить позицию'))

function close() {
  editingId.value = null
}

/** Returns true when the editor may close. */
function save(): boolean {
  const it = item.value
  const d = draft.value
  if (!it || !d || d.kind === 'missing') return true
  if (!dirty.value) return true

  if (d.kind === 'photobooks') {
    const result = saveProject(d.projectId, clone(d.value), d.baseVersion)
    if (result.status === 'conflict') {
      conflict.value = { latest: result.latest, fields: conflictingFields(d.base, d.value, result.latest) }
      return false
    }
    if (result.status === 'failed') {
      saveError.value = true
      return false
    }
    syncPhotobookPosition(cart, result.project)
    announceBookSaved(d.projectId, 'editor')
  } else {
    const next = d.kind === 'booth' ? boothItem(d.value) : d.kind === 'photography' ? photographyItem(d.value) : photozoneItem(d.value)
    if (!next) return true
    // A ready photo zone keeps its own concept, so the key never collides with another position.
    cart.update(it.id, next)
  }
  announce(`Изменения сохранены: ${cart.findById(it.id)?.title ?? it.title}.`, it.id)
  return true
}

function onSave() {
  if (save()) close()
}

/** ✕ / Esc / backdrop. */
async function onCloseRequest() {
  if (!dirty.value) return close()
  const answer = await confirm.ask({
    title: 'Сохранить изменения?',
    message: 'В позиции есть несохранённые изменения.',
    confirmLabel: 'Сохранить изменения',
    cancelLabel: 'Выйти без сохранения',
  })
  if (answer === 'confirm') onSave()
  else if (answer === 'cancel') close()
}

/* ---------- Photobook version conflict ---------- */

function loadLatest() {
  const d = draft.value
  if (d?.kind !== 'photobooks') return
  const latest = readProject(d.projectId) ?? conflict.value?.latest
  if (!latest) return
  const state = { config: latest.config, layoutComplete: latest.layoutComplete }
  draft.value = { ...d, value: clone(state), base: clone(state), baseVersion: latest.version }
  initial.value = clone(state)
  conflict.value = null
}

function reapplyMine() {
  const d = draft.value
  if (d?.kind !== 'photobooks') return
  const latest = readProject(d.projectId) ?? conflict.value?.latest
  if (!latest) return
  const merged = mergeStates(d.base, d.value, latest)
  const state = { config: latest.config, layoutComplete: latest.layoutComplete }
  draft.value = { ...d, value: merged, base: clone(state), baseVersion: latest.version }
  conflict.value = null
  onSave()
}

async function openStudio() {
  const href = item.value?.href
  if (!href) return
  if (dirty.value) {
    const answer = await confirm.ask({
      title: 'Сохранить изменения?',
      message: 'Перед переходом в Book Studio сохраните или отмените изменения.',
      confirmLabel: 'Сохранить изменения',
      cancelLabel: 'Выйти без сохранения',
    })
    if (answer === 'dismiss') return
    if (answer === 'confirm' && !save()) return
  }
  close()
  await navigateTo(href)
}
</script>

<template>
  <BaseDialog v-model:open="open" :title="title" size="md" guarded @close-request="onCloseRequest">
    <template v-if="item && draft">
      <!-- Version conflict: never overwrite a newer book silently. -->
      <div v-if="conflict" role="alert" class="mb-6 rounded-card border border-warning/40 bg-warning/8 p-4 text-sm">
        <p class="flex gap-2.5 font-semibold">
          <AlertCircle class="mt-0.5 size-4 shrink-0 text-warning" :stroke-width="2" aria-hidden="true" />
          Книгу изменили в другом окне, пока вы её редактировали.
        </p>
        <p v-if="conflict.fields.length" class="mt-2 text-muted">
          Изменены и там, и здесь: {{ conflict.fields.join(', ').toLowerCase() }}. При повторном применении в этих полях останутся ваши значения, остальные изменения другого окна сохранятся.
        </p>
        <p v-else class="mt-2 text-muted">Ваши изменения не пересекаются с изменениями другого окна — их можно применить поверх.</p>
        <div class="mt-3 flex flex-col gap-2 sm:flex-row">
          <BaseButton variant="secondary" @click="loadLatest">Загрузить актуальную версию</BaseButton>
          <BaseButton @click="reapplyMine">Повторно применить мои изменения</BaseButton>
        </div>
      </div>

      <p v-if="saveError" role="alert" class="mb-6 rounded-card border border-error/30 bg-error/6 p-4 text-sm">
        Не удалось сохранить книгу на этом устройстве (хранилище браузера недоступно).
      </p>

      <BoothEditor v-if="draft.kind === 'booth'" v-model="draft.value" />
      <PhotographyEditor v-else-if="draft.kind === 'photography'" v-model="draft.value" />
      <PhotozoneEditor v-else-if="draft.kind === 'photozones'" v-model="draft.value" />
      <template v-else-if="draft.kind === 'photobooks'">
        <PhotobookEditor v-model="draft.value" />
        <button
          type="button"
          class="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-[6px] hover:underline"
          @click="openStudio"
        >
          Открыть в Book Studio — развороты и фотографии
          <ArrowUpRight class="size-4" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </template>
      <p v-else class="text-[0.9375rem] leading-relaxed text-muted">
        <template v-if="item.service === 'photobooks'">
          Проект этой книги не найден на этом устройстве — возможно, данные браузера были очищены. Позиция останется в
          заявке с сохранёнными параметрами; изменения можно описать в комментарии к заявке.
        </template>
        <template v-else>Параметры этой позиции нельзя изменить здесь. Удалите её и добавьте заново на странице услуги.</template>
      </p>
    </template>

    <template v-if="item && draft" #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" @click="close">{{ draft.kind === 'missing' ? 'Закрыть' : 'Отмена' }}</BaseButton>
        <BaseButton v-if="draft.kind !== 'missing'" :disabled="Boolean(conflict)" @click="onSave">Сохранить</BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>
