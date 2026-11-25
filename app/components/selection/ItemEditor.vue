<script setup lang="ts">
import { AlertCircle } from '@lucide/vue'
import type { CartItem } from '~/types/cart'
import { photobookPresets } from '~/config/photobook/presets'
import {
  isDeliveryDate,
  PERSONAL_COLLECTION_ORDER,
  PHOTOBOOK_QUOTE_LABEL,
  photobookCollectionDetails,
  photobookCollectionOrder,
  readPhotobookCollectionOrder,
  type PhotobookCollectionPreferences,
} from '#shared/photobookCollection'
import {
  INDIVIDUAL_PHOTOBOOK_ORDER,
  isPersonalPhotobookOrder,
  readPhotobookGuideOrder,
  type PhotobookGuideOrder,
} from '#shared/photobookGuide'
import { GRADUATION_PHOTOBOOK_ORDER, graduationOrderFromDraft, readGraduationOrder, type GraduationDraft } from '#shared/graduationPhotobook'
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
  graduationPhotobookItem,
  photobookCollectionItem,
  photobookCollectionKey,
  photobookGuideItem,
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
 * Legacy photobook edits save the linked project with a version check, then sync its position.
 */
type Draft =
  | { kind: 'booth'; value: BoothConfig }
  | { kind: 'photography'; value: PhotographyConfig }
  | { kind: 'photozones'; value: PhotozoneConfig }
  | { kind: 'photobook-collection'; value: PhotobookCollectionPreferences }
  | { kind: 'photobook-individual'; value: PhotobookGuideOrder }
  | { kind: 'photobook-graduation'; value: GraduationDraft; savedTemplateId: string }
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
const personalBookError = ref('')
const graduationError = ref('')
const uid = useId()

const collectionDetails = computed(() =>
  draft.value?.kind === 'photobook-collection'
    ? photobookCollectionDetails(photobookCollectionOrder({ presetId: draft.value.value.presetId }))
    : [],
)

function collectionTaken(presetId: PhotobookCollectionPreferences['presetId']): boolean {
  const existing = cart.find(photobookCollectionKey(presetId))
  return Boolean(existing && existing.id !== item.value?.id)
}

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
      if (it.config.orderType === PERSONAL_COLLECTION_ORDER) {
        const order = readPhotobookCollectionOrder(it.config)
        if (!order) return { kind: 'missing' }
        return {
          kind: 'photobook-collection',
          value: { presetId: order.presetId, desiredDeliveryDate: order.desiredDeliveryDate ?? '' },
        }
      }
      if (it.config.orderType === INDIVIDUAL_PHOTOBOOK_ORDER) {
        const order = readPhotobookGuideOrder(it.config)
        return order ? { kind: 'photobook-individual', value: order } : { kind: 'missing' }
      }
      if (it.config.orderType === GRADUATION_PHOTOBOOK_ORDER) {
        const order = readGraduationOrder(it.config, { allowDisabled: true })
        return order ? { kind: 'photobook-graduation', value: order, savedTemplateId: order.templateId } : { kind: 'missing' }
      }
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
    personalBookError.value = ''
    graduationError.value = ''
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
  } else if (d.kind === 'photobook-collection' || d.kind === 'photobook-individual') {
    const date = d.value.desiredDeliveryDate
    if (date && !isDeliveryDate(date)) {
      personalBookError.value = 'Проверьте желаемую дату получения.'
      return false
    }
    const next = d.kind === 'photobook-collection'
      ? photobookCollectionItem(d.value)
      : photobookGuideItem(d.value.specification, date)
    const result = cart.update(it.id, next)
    if (result === 'key-conflict') {
      personalBookError.value = d.kind === 'photobook-collection'
        ? 'Эта коллекция уже в подборке. Выберите другую.'
        : 'Фотокнига с такими параметрами уже в подборке. Выберите другие параметры.'
      return false
    }
    if (result === 'missing') return true
  } else if (d.kind === 'photobook-graduation') {
    const order = graduationOrderFromDraft(d.value, { allowDisabled: d.value.templateId === d.savedTemplateId })
    if (!order) {
      graduationError.value = 'Проверьте шаблон, количество экземпляров и даты.'
      return false
    }
    const result = cart.update(it.id, graduationPhotobookItem(order))
    if (result === 'key-conflict') {
      graduationError.value = 'Заказ с такими параметрами уже в подборке.'
      return false
    }
    if (result === 'missing') return true
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
      <div v-else-if="draft.kind === 'photobook-collection' || draft.kind === 'photobook-individual'" class="grid gap-4">
        <template v-if="draft.kind === 'photobook-collection'">
          <div>
            <label :for="`${uid}-collection`" class="mb-1.5 block text-sm font-semibold">Коллекция</label>
            <select :id="`${uid}-collection`" v-model="draft.value.presetId" class="field-input" @change="personalBookError = ''">
              <option v-for="preset in photobookPresets" :key="preset.id" :value="preset.id" :disabled="collectionTaken(preset.id)">
                {{ preset.name }}{{ collectionTaken(preset.id) ? ' · уже в подборке' : '' }}
              </option>
            </select>
          </div>
          <ul class="grid gap-1 text-sm text-muted" aria-label="Параметры коллекции">
            <li v-for="detail in collectionDetails" :key="detail">{{ detail }}</li>
          </ul>
        </template>
        <PhotobookGuideControls v-else v-model="draft.value.specification" @update:model-value="personalBookError = ''" />
        <p class="text-sm font-semibold">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
        <div>
          <label :for="`${uid}-delivery`" class="mb-1.5 block text-sm font-semibold">Желаемая дата получения (необязательно)</label>
          <input :id="`${uid}-delivery`" v-model="draft.value.desiredDeliveryDate" class="field-input" type="date" @input="personalBookError = ''">
        </div>
        <p v-if="personalBookError" class="text-sm text-error" role="alert">{{ personalBookError }}</p>
      </div>
      <div v-else-if="draft.kind === 'photobook-graduation'" class="grid gap-4">
        <GraduationOrderFields v-model="draft.value" :saved-template-id="draft.savedTemplateId" @update:model-value="graduationError = ''" />
        <p class="text-sm font-semibold">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
        <p v-if="graduationError" class="text-sm text-error" role="alert">{{ graduationError }}</p>
      </div>
      <PhotobookEditor v-else-if="draft.kind === 'photobooks'" v-model="draft.value" />
      <p v-else class="text-[0.9375rem] leading-relaxed text-muted">
        <template v-if="isPersonalPhotobookOrder(item.config.orderType) || item.config.orderType === GRADUATION_PHOTOBOOK_ORDER">
          Параметры этой книги недоступны. Удалите позицию и выберите параметры заново на странице фотокниг.
        </template>
        <template v-else-if="item.service === 'photobooks'">
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
