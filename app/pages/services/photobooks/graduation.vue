<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { brand } from '~/config/brand'
import { findGraduationTemplate, graduationInstitutions, graduationTemplatesFor, type GraduationInstitution } from '~/config/photobook/graduation'
import { graduationAlbumSample } from '~/config/photobook/showcase'
import { graduationPhotobookItem } from '~/lib/selection'
import {
  GRADUATION_PHOTOBOOK_ORDER,
  graduationCounts,
  graduationOrderFromDraft,
  graduationPhotography,
  isGraduationInstitution,
  type GraduationDraft,
} from '#shared/graduationPhotobook'
import { PHOTOBOOK_QUOTE_LABEL } from '#shared/photobookCollection'

definePageMeta({ service: 'photobooks' })

const title = 'Выпускные альбомы для детских садов и школ'
const description = 'Выпускные альбомы MOMENTO для детских садов и школ. Фотосъёмка по желанию, оформление и согласование макета для всей группы.'
const canonical = `${useRequestURL().origin}/services/photobooks/graduation`

useSeoMeta({
  title,
  description,
  ogTitle: `${title} — ${brand.name}`,
  ogDescription: description,
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogUrl: canonical,
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })

const { addToSelection } = useSelection()
const queryType = useRoute().query.type
const draft = ref<GraduationDraft>({
  orderType: GRADUATION_PHOTOBOOK_ORDER,
  institutionType: isGraduationInstitution(queryType) ? queryType : 'kindergarten',
  templateId: '',
  children: '',
  additionalCopies: 0,
  photography: 'provided',
})
const batchSize = 3
const visibleCount = ref(batchSize)
const templates = computed(() => graduationTemplatesFor(draft.value.institutionType))
const visibleTemplates = computed(() => templates.value.slice(0, visibleCount.value))
const order = computed(() => graduationOrderFromDraft(draft.value))
const counts = computed(() => graduationCounts(draft.value.children, draft.value.additionalCopies, draft.value.photography))
const selectedTemplate = computed(() => findGraduationTemplate(draft.value.templateId))
const uid = useId()

watch(() => draft.value.institutionType, () => { visibleCount.value = batchSize })

function selectInstitution(institutionType: GraduationInstitution) {
  const compatible = graduationTemplatesFor(institutionType).some(({ id }) => id === draft.value.templateId)
  draft.value = { ...draft.value, institutionType, templateId: compatible ? draft.value.templateId : '' }
}

function addOrder() {
  if (order.value) void addToSelection(graduationPhotobookItem(order.value))
}

const steps = [
  'Вы отправляете групповую заявку.',
  'Мы согласуем тираж, оформление и условия.',
  'Вы передаёте снимки или мы проводим съёмку.',
  'Мы готовим и согласуем с вами макет.',
  'Изготавливаем и передаём альбомы.',
]
const faq = [
  { question: 'Можно ли заказать альбомы со своими фотографиями?', answer: 'Да. Выберите «Свои фотографии». Как передать снимки и какие кадры подойдут, обсудим при согласовании заявки.' },
  { question: 'Можно ли добавить альбомы для учителей и воспитателей?', answer: 'Да. Укажите число дополнительных экземпляров отдельно. Оно увеличивает тираж, а количество детей на съёмке остаётся прежним.' },
  { question: 'Как организовать групповую заявку?', answer: 'Укажите шаблон, количество детей и дополнительные экземпляры в одной заявке. Условия и детали обсудим с представителем группы.' },
  { question: 'Как согласовывается макет?', answer: 'Мы подготавливаем макет после получения снимков и согласуем оформление с вами перед изготовлением.' },
  { question: 'Как рассчитывается стоимость?', answer: 'Стоимость рассчитывается индивидуально с учётом тиража и выбранного формата работы с фотографиями.' },
  { question: 'Когда передавать фотографии детей?', answer: 'Порядок передачи обсудим отдельно после заявки. Для расчёта нужны только параметры заказа и количество детей.' },
]
</script>

<template>
  <div>
    <PhotobooksLocalNav />
    <PhotobooksHero
      eyebrow="Выпускные альбомы"
      title="Целая глава жизни"
      emphasis="в одной книге."
      description="Альбомы для детских садов и школ. Соберём в одной книге портреты, общие фотографии и моменты взросления. Можно использовать свои кадры или обсудить фотосъёмку."
      :image="graduationAlbumSample"
      tone="sage"
    >
      <p class="text-sm font-semibold text-muted">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
      <div class="flex flex-wrap gap-2.5">
        <BaseButton to="#graduation-templates">
          Выбрать шаблон
          <template #icon><ArrowDown class="size-4" /></template>
        </BaseButton>
        <BaseButton to="#graduation-calculator" variant="secondary">Рассчитать тираж</BaseButton>
      </div>
    </PhotobooksHero>

    <section id="graduation-templates" class="bg-surface py-12 sm:py-16" aria-labelledby="graduation-templates-title" tabindex="-1">
      <div class="container-page">
        <SectionHeading title="Шаблоны оформления" heading-id="graduation-templates-title" lead="Выберите идею оформления. Макет подготовим по фотографиям вашей группы или класса." />
        <fieldset class="mt-6">
          <legend class="text-sm font-semibold">Для кого альбом</legend>
          <div class="mt-2 flex flex-wrap gap-2">
            <label v-for="(label, value) in graduationInstitutions" :key="value" class="chip" :class="draft.institutionType === value && 'is-selected'">
              <input class="sr-only" type="radio" :name="`${uid}-catalog-institution`" :value="value" :checked="draft.institutionType === value" @change="selectInstitution(value)">
              {{ label }}
            </label>
          </div>
        </fieldset>
        <ul v-if="visibleTemplates.length" class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Шаблоны оформления">
          <li v-for="template in visibleTemplates" :key="template.id">
            <GraduationTemplateCard :template="template" :selected="draft.templateId === template.id" @select="draft.templateId = template.id" />
          </li>
        </ul>
        <p v-else class="mt-6 rounded-card bg-bg p-5 text-sm text-muted" role="status">Для этого учреждения пока нет доступных шаблонов.</p>
        <BaseButton v-if="visibleCount < templates.length" variant="secondary" class="mt-5" @click="visibleCount += batchSize">
          Показать ещё шаблоны
        </BaseButton>
      </div>
    </section>

    <section id="graduation-calculator" class="container-page py-12 sm:py-16" aria-labelledby="graduation-calculator-title" tabindex="-1">
      <SectionHeading title="Групповой заказ" heading-id="graduation-calculator-title" lead="Укажите количество детей и дополнительные экземпляры." />
      <form class="mt-6 grid gap-6 rounded-card border border-border bg-surface p-4 sm:p-6 lg:grid-cols-[3fr_2fr] lg:gap-9" @submit.prevent="addOrder">
        <GraduationOrderFields v-model="draft" />
        <div class="self-start rounded-card bg-[#e3e8de] p-5">
          <h3 class="font-display text-h3">Ваша заявка</h3>
          <p class="mt-2 text-sm font-semibold">{{ graduationInstitutions[draft.institutionType] }} · {{ selectedTemplate?.name ?? 'выберите шаблон' }}</p>
          <p class="mt-1 text-sm text-muted">{{ graduationPhotography[draft.photography] }}</p>
          <dl v-if="counts" class="mt-4 grid gap-2 text-sm" aria-live="polite">
            <div class="flex justify-between gap-3"><dt>Альбомы для детей</dt><dd class="tabular-nums">{{ counts.children }}</dd></div>
            <div class="flex justify-between gap-3"><dt>Дополнительные альбомы</dt><dd class="tabular-nums">{{ counts.additionalCopies }}</dd></div>
            <div class="flex justify-between gap-3 font-semibold"><dt>Всего альбомов</dt><dd class="tabular-nums">{{ counts.albums }}</dd></div>
            <div class="flex justify-between gap-3"><dt>Детей на фотосъёмке</dt><dd class="tabular-nums">{{ counts.photos }}</dd></div>
          </dl>
          <p v-else class="mt-4 text-sm text-muted">Укажите количество детей и дополнительных экземпляров для расчёта тиража.</p>
          <p class="mt-5 border-t border-border pt-4 text-sm font-semibold">{{ PHOTOBOOK_QUOTE_LABEL }}</p>
          <BaseButton type="submit" class="mt-4" :disabled="!order">Добавить в заявку</BaseButton>
        </div>
      </form>
    </section>

    <section class="border-y border-border bg-surface py-12 sm:py-16" aria-labelledby="graduation-process-title">
      <div class="container-page">
        <SectionHeading title="Как проходит заказ" heading-id="graduation-process-title" />
        <ol class="mt-6 list-decimal gap-x-8 gap-y-3 pl-6 marker:font-semibold marker:text-accent sm:grid sm:grid-cols-2 lg:grid-cols-5">
          <li v-for="step in steps" :key="step" class="py-2 pl-1">{{ step }}</li>
        </ol>
      </div>
    </section>

    <section class="container-page grid gap-6 py-12 sm:py-16 lg:grid-cols-[1fr_1.5fr] lg:gap-10" aria-labelledby="graduation-faq-title">
      <SectionHeading title="Вопросы о выпускных альбомах" heading-id="graduation-faq-title" />
      <FaqAccordion :items="faq" />
    </section>

    <section class="container-page pb-12 sm:pb-16" aria-labelledby="graduation-cta-title">
      <div class="flex flex-wrap items-center justify-between gap-5 rounded-card bg-[#e3e8de] p-6 sm:p-9">
        <SectionHeading title="Сохраним историю вашей группы или класса" heading-id="graduation-cta-title" />
        <BaseButton to="#graduation-calculator">
          Рассчитать тираж
          <template #icon><ArrowUp class="size-4" /></template>
        </BaseButton>
      </div>
    </section>
  </div>
</template>
