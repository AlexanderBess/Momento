<script setup lang="ts">
import { graduationInstitutions, graduationTemplatesFor, type GraduationInstitution } from '~/config/photobook/graduation'
import { graduationCounts, graduationPhotography, type GraduationDraft } from '#shared/graduationPhotobook'

const props = defineProps<{ savedTemplateId?: string }>()
const draft = defineModel<GraduationDraft>({ required: true })
const uid = useId()
const templates = computed(() => graduationTemplatesFor(draft.value.institutionType, props.savedTemplateId))
const retired = computed(() => templates.value.some((template) => template.id === draft.value.templateId && !template.enabled))
const invalidCounts = computed(() => draft.value.children !== '' && draft.value.additionalCopies !== ''
  && !graduationCounts(draft.value.children, draft.value.additionalCopies, draft.value.photography))

function patch(value: Partial<GraduationDraft>) {
  draft.value = { ...draft.value, ...value }
}

function selectInstitution(institutionType: GraduationInstitution) {
  const available = graduationTemplatesFor(institutionType, props.savedTemplateId)
  const templateId = available.some(({ id }) => id === draft.value.templateId) ? draft.value.templateId : ''
  patch({ institutionType, templateId })
}

const institution = computed({ get: () => draft.value.institutionType, set: selectInstitution })
const templateId = computed({ get: () => draft.value.templateId, set: (value) => patch({ templateId: value }) })

function readCount(event: Event): number | '' {
  const input = event.target as HTMLInputElement
  return input.value === '' ? '' : input.valueAsNumber
}

function selectPhotography(photography: GraduationDraft['photography']) {
  patch({
    photography,
    preferredPhotographyDate: photography === 'momento' ? draft.value.preferredPhotographyDate : undefined,
  })
}
</script>

<template>
  <div class="grid min-w-0 gap-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`${uid}-institution`" class="mb-1.5 block text-sm font-semibold">Учреждение</label>
        <select :id="`${uid}-institution`" v-model="institution" class="field-input">
          <option v-for="(label, value) in graduationInstitutions" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>
      <div>
        <label :for="`${uid}-template`" class="mb-1.5 block text-sm font-semibold">Шаблон</label>
        <select :id="`${uid}-template`" v-model="templateId" class="field-input" required :disabled="!templates.length">
          <option value="" disabled>{{ templates.length ? 'Выберите шаблон' : 'Нет доступных шаблонов' }}</option>
          <option v-for="template in templates" :key="template.id" :value="template.id" :disabled="!template.enabled">
            {{ template.name }}{{ template.enabled ? '' : ' · снят с выбора' }}
          </option>
        </select>
        <p v-if="retired" class="mt-1.5 text-xs text-muted">Для отправки заявки выберите доступный шаблон.</p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`${uid}-children`" class="mb-1.5 block text-sm font-semibold">Количество детей</label>
        <input :id="`${uid}-children`" :value="draft.children" class="field-input" type="number" inputmode="numeric" min="1" step="1" required @input="patch({ children: readCount($event) })">
      </div>
      <div>
        <label :for="`${uid}-copies`" class="mb-1.5 block text-sm font-semibold">Экземпляры для сотрудников</label>
        <input :id="`${uid}-copies`" :value="draft.additionalCopies" class="field-input" type="number" inputmode="numeric" min="0" step="1" required @input="patch({ additionalCopies: readCount($event) })">
      </div>
    </div>
    <p v-if="invalidCounts" role="status" class="text-sm text-error">Укажите целое положительное число детей и целое число дополнительных экземпляров от нуля.</p>

    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold">Фотографии</legend>
      <div class="mt-2 flex flex-wrap gap-1.5">
        <label v-for="(label, value) in graduationPhotography" :key="value" class="chip" :class="draft.photography === value && 'is-selected'">
          <input class="sr-only" type="radio" :name="`${uid}-photography`" :value="value" :checked="draft.photography === value" @change="selectPhotography(value)">
          {{ label }}
        </label>
      </div>
    </fieldset>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`${uid}-delivery`" class="mb-1.5 block text-sm font-semibold">Желаемая дата получения</label>
        <input :id="`${uid}-delivery`" :value="draft.desiredDeliveryDate" class="field-input" type="date" @input="patch({ desiredDeliveryDate: ($event.target as HTMLInputElement).value })">
      </div>
      <div v-if="draft.photography === 'momento'">
        <label :for="`${uid}-session`" class="mb-1.5 block text-sm font-semibold">Желаемая дата съёмки</label>
        <input :id="`${uid}-session`" :value="draft.preferredPhotographyDate" class="field-input" type="date" @input="patch({ preferredPhotographyDate: ($event.target as HTMLInputElement).value })">
      </div>
      <p class="text-xs text-muted sm:col-span-2">Даты можно указать по желанию.</p>
    </div>
  </div>
</template>
