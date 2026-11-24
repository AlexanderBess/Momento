<script setup lang="ts">
import { AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown, Info, LoaderCircle } from '@lucide/vue'
import {
  CONTACT_CHANNEL_LABELS,
  CONTACT_CHANNELS,
  todayIso,
  validateLead,
  type LeadEventType,
  type LeadFailureReason,
  type LeadField,
  type LeadItem,
} from '#shared/lead'
import { eventTypeLabels, eventTypes } from '~/config/order'
import { services } from '~/config/services'
import { sortKeys } from '~/lib/ids'
import { submitLead } from '~/lib/leads'
import { positionsLabel, readBoothConfig } from '~/lib/selection'

/**
 * The single request form for every service: everything in «Моя подборка» + optional event
 * details (for the whole request) + contacts. Sent via the server (/api/leads → Telegram).
 *
 * - Success is shown only after the server confirmed delivery; then the selection and the saved
 *   form are cleared.
 * - Any failure keeps the selection and every typed value, and allows a retry. Retries reuse the
 *   idempotency key, so one request is never delivered twice.
 * - A request is not a booking: the team contacts the client and agrees everything manually.
 */
useSeoMeta({ title: 'Оформление заявки', robots: 'noindex, follow' })

const cart = useCart()
const { items, ready, total } = cart
const { openDrawer } = useSelection()
const requestDraft = useRequestDraft()
const { draft: form } = requestDraft
const route = useRoute()
const uid = useId()

const eventOptions: { id: LeadEventType; label: string }[] = [
  ...eventTypes.map((id) => ({ id, label: eventTypeLabels[id] })),
  { id: 'other', label: 'Другое' },
]

/* ---------- Draft: restore, prefill, autosave ---------- */

let saveTimer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  onNuxtReady(() => {
    if (!requestDraft.loaded.value) requestDraft.load()
    // The booth position may already carry the event type.
    if (!form.value.event.type) {
      const booth = items.value.find((i) => i.service === 'booth')
      const type = booth ? readBoothConfig(booth.config).eventType : null
      if (type) form.value.event.type = type
    }
    watch(
      form,
      () => {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(requestDraft.save, 400)
      },
      { deep: true },
    )
  })
})
onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  requestDraft.save()
})

const consent = ref(false)

/* ---------- Validation ---------- */

const touched = ref(false)
const serverErrors = ref<Partial<Record<LeadField, string>>>({})

const leadItems = computed<LeadItem[]>(() =>
  items.value.map((i) => ({
    id: i.id,
    service: i.service,
    title: i.title,
    subtitle: i.subtitle ?? null,
    details: i.details,
    status: i.status ?? null,
    price: i.price,
    pricePartial: Boolean(i.pricePartial),
    priceIsDemo: Boolean(i.priceIsDemo),
    quantity: i.quantity,
    config: i.config,
  })),
)

const payload = computed(() => {
  const e = form.value.event
  const c = form.value.contact
  return {
    items: leadItems.value,
    event: {
      type: e.type,
      date: e.date || null,
      time: e.time || null,
      duration: e.duration.trim() || null,
      venue: e.venue.trim() || null,
      wishes: e.wishes.trim() || null,
    },
    contact: {
      name: c.name.trim(),
      phone: c.phone.trim(),
      channel: c.channel ?? ('' as never),
      telegram: c.channel === 'telegram' ? c.telegram.trim() || null : null,
      email: c.channel === 'email' ? c.email.trim() || null : null,
      comment: c.comment.trim() || null,
    },
  }
})

const errors = computed(() => ({ ...validateLead({ ...payload.value, consent: consent.value }), ...serverErrors.value }))
const shownError = (field: LeadField) => (touched.value ? errors.value[field] : undefined)

// A server-side remark disappears as soon as the field is changed.
watch(
  () => [form.value.contact, form.value.event],
  () => (serverErrors.value = {}),
  { deep: true },
)

// Event block errors must be visible even while the block is collapsed.
watch(touched, (value) => {
  if (value && (errors.value.date || errors.value.time)) form.value.eventOpen = true
})

/* ---------- Sending ---------- */

type Status = { state: 'idle' | 'sending' } | { state: 'failed'; reason: LeadFailureReason } | { state: 'success'; number: string }
const status = ref<Status>({ state: 'idle' })
const formEl = useTemplateRef<HTMLFormElement>('formEl')
const successEl = useTemplateRef<HTMLElement>('successEl')

async function submit() {
  // Double clicks and Enter repeats while a request is on its way do nothing.
  if (status.value.state === 'sending') return
  touched.value = true
  serverErrors.value = {}
  if (Object.keys(errors.value).length) {
    if (errors.value.date || errors.value.time) form.value.eventOpen = true
    await nextTick()
    formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  status.value = { state: 'sending' }
  const content = JSON.stringify(sortKeys(payload.value))
  const idempotencyKey = requestDraft.keyFor(content)
  const result = await submitLead({
    idempotencyKey,
    ...payload.value,
    consent: { personalData: true, at: new Date().toISOString() },
    source: { page: route.fullPath },
    website: honeypot.value,
  })

  if (result.ok) {
    cart.clear()
    requestDraft.clear()
    consent.value = false
    touched.value = false
    status.value = { state: 'success', number: result.requestNumber }
    await nextTick()
    window.scrollTo({ top: 0 })
    successEl.value?.focus()
    return
  }

  requestDraft.markFailure(result.reason)
  if (result.reason === 'invalid' && result.fields) serverErrors.value = result.fields
  status.value = { state: 'failed', reason: result.reason }
}

const failureText: Record<LeadFailureReason, string> = {
  'not-configured':
    'Онлайн-отправка заявок пока не подключена. Подборка и заполненные поля сохранены на этом устройстве. Попробуйте отправить заявку позже.',
  network: 'Не удалось связаться с сервером. Проверьте подключение и отправьте ещё раз — заявка не продублируется.',
  'delivery-failed': 'Сервер не смог передать заявку команде. Данные сохранены — попробуйте отправить ещё раз чуть позже.',
  invalid: 'Проверьте отмеченные поля.',
  rejected: 'Сервер не принял заявку. Попробуйте ещё раз чуть позже.',
}

/** Honeypot field — hidden from people, sometimes filled by bots. */
const honeypot = ref('')

const minDate = todayIso()
</script>

<template>
  <section class="container-page pt-10 pb-20 md:pt-14 md:pb-28">
    <!-- ---------- Success (only after the server confirmed delivery) ---------- -->
    <div v-if="status.state === 'success'" ref="successEl" tabindex="-1" class="mx-auto flex max-w-xl flex-col items-center py-10 text-center outline-none">
      <span class="inline-flex size-14 items-center justify-center rounded-full bg-success/12 text-success" aria-hidden="true">
        <Check class="size-6" :stroke-width="2" />
      </span>
      <h1 class="mt-6 font-display text-h2">Заявка отправлена!</h1>
      <p class="mt-3 text-sm text-muted">Номер заявки: <span class="font-semibold text-text tabular-nums">{{ status.number }}</span></p>
      <p class="mt-5 text-lead text-muted">
        Мы получили вашу заявку и свяжемся с вами, чтобы обсудить детали. Заявка не бронирует дату — всё подтвердим
        вручную. Если нужно что-то изменить, просто скажите об этом, когда мы свяжемся.
      </p>
      <BaseButton to="/#services" size="lg" class="mt-9">
        Вернуться к услугам
        <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
      </BaseButton>
    </div>

    <template v-else>
      <SectionHeading as="h1" eyebrow="Оформление" title="Ваша заявка" />

      <!-- Saved selection is read on the client; keep the space quiet until then. -->
      <div v-if="!ready" class="mt-12 h-40" aria-busy="true" />

      <div v-else-if="!items.length" class="mt-12 max-w-xl">
        <p class="text-lead text-muted">
          В подборке пока ничего нет. Выберите услугу — всё, что вы добавите, соберётся здесь в одну заявку.
        </p>
        <ul class="mt-8 grid gap-2 sm:grid-cols-2">
          <li v-for="service in services" :key="service.slug">
            <NuxtLink
              :to="service.href"
              class="group flex min-h-14 items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-3 transition-colors hover:border-text/40"
            >
              <span class="font-semibold">{{ service.title }}</span>
              <ArrowRight class="size-4 text-muted transition-transform group-hover:translate-x-0.5" :stroke-width="2" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </div>

      <form v-else ref="formEl" class="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-10" novalidate @submit.prevent="submit">
        <div class="flex min-w-0 flex-col gap-12 lg:col-span-7">
          <!-- ---------- 1. Composition ---------- -->
          <section :aria-labelledby="`${uid}-items`">
            <div class="flex items-baseline justify-between gap-4">
              <h2 :id="`${uid}-items`" class="font-display text-h3">Состав заявки</h2>
              <span class="text-sm text-muted">{{ positionsLabel(items.length) }}</span>
            </div>
            <div class="mt-5">
              <SelectionList />
            </div>
            <p v-if="shownError('items')" class="mt-2 text-sm text-error">{{ shownError('items') }}</p>
            <NuxtLink to="/#services" class="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-[6px] hover:underline">
              <ArrowLeft class="size-4" :stroke-width="1.75" aria-hidden="true" />
              Добавить другие услуги
            </NuxtLink>
          </section>

          <!-- ---------- 2. About the event (optional, collapsed) ---------- -->
          <section class="rounded-card bg-surface ring-1 ring-border">
            <h2>
              <button
                type="button"
                class="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                :aria-expanded="form.eventOpen"
                :aria-controls="`${uid}-event`"
                @click="form.eventOpen = !form.eventOpen"
              >
                <span class="flex flex-col">
                  <span class="font-display text-[1.625rem] leading-tight">О мероприятии</span>
                  <span class="text-sm text-muted">Необязательно — дата, место и пожелания для всей заявки</span>
                </span>
                <ChevronDown
                  class="size-5 shrink-0 text-muted transition-transform duration-(--motion-normal)"
                  :class="form.eventOpen && 'rotate-180'"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
              </button>
            </h2>
            <!-- v-show keeps the values while collapsed. -->
            <div v-show="form.eventOpen" :id="`${uid}-event`" class="grid gap-5 border-t border-border px-5 pt-5 pb-6 sm:px-6">
              <fieldset>
                <legend class="text-sm font-semibold">Тип мероприятия</legend>
                <div class="mt-3 flex flex-wrap gap-2">
                  <label v-for="option in eventOptions" :key="option.id" class="chip" :class="form.event.type === option.id && 'is-selected'">
                    <input
                      type="radio"
                      class="sr-only"
                      :name="`${uid}-event-type`"
                      :checked="form.event.type === option.id"
                      @change="form.event.type = option.id"
                      @click="form.event.type === option.id && (form.event.type = null)"
                    >
                    {{ option.label }}
                  </label>
                </div>
              </fieldset>

              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label :for="`${uid}-date`" class="mb-1.5 block text-sm font-semibold">Дата</label>
                  <input
                    :id="`${uid}-date`"
                    v-model="form.event.date"
                    class="field-input"
                    type="date"
                    :min="minDate"
                    :aria-invalid="Boolean(shownError('date'))"
                    :aria-describedby="shownError('date') ? `${uid}-date-error` : undefined"
                  >
                  <p v-if="shownError('date')" :id="`${uid}-date-error`" class="mt-1.5 text-xs text-error">{{ shownError('date') }}</p>
                </div>
                <div>
                  <label :for="`${uid}-time`" class="mb-1.5 block text-sm font-semibold">Время начала</label>
                  <input
                    :id="`${uid}-time`"
                    v-model="form.event.time"
                    class="field-input"
                    type="time"
                    :aria-invalid="Boolean(shownError('time'))"
                    :aria-describedby="shownError('time') ? `${uid}-time-error` : undefined"
                  >
                  <p v-if="shownError('time')" :id="`${uid}-time-error`" class="mt-1.5 text-xs text-error">{{ shownError('time') }}</p>
                </div>
              </div>

              <div>
                <label :for="`${uid}-duration`" class="mb-1.5 block text-sm font-semibold">Длительность</label>
                <input :id="`${uid}-duration`" v-model="form.event.duration" class="field-input" type="text" maxlength="200" placeholder="Например, 4 часа">
              </div>

              <div>
                <label :for="`${uid}-venue`" class="mb-1.5 block text-sm font-semibold">Место проведения / адрес</label>
                <input :id="`${uid}-venue`" v-model="form.event.venue" class="field-input" type="text" maxlength="200" autocomplete="street-address">
              </div>

              <div>
                <label :for="`${uid}-wishes`" class="mb-1.5 block text-sm font-semibold">Дополнительные пожелания</label>
                <textarea :id="`${uid}-wishes`" v-model="form.event.wishes" class="field-input min-h-24 resize-y" rows="3" maxlength="1500" />
              </div>
            </div>
          </section>

          <!-- ---------- 3. Contacts ---------- -->
          <section :aria-labelledby="`${uid}-contacts`" class="grid gap-5">
            <h2 :id="`${uid}-contacts`" class="font-display text-h3">Контактные данные</h2>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label :for="`${uid}-name`" class="mb-1.5 block text-sm font-semibold">Имя</label>
                <input
                  :id="`${uid}-name`"
                  v-model="form.contact.name"
                  class="field-input"
                  type="text"
                  autocomplete="name"
                  maxlength="80"
                  required
                  :aria-invalid="Boolean(shownError('name'))"
                  :aria-describedby="shownError('name') ? `${uid}-name-error` : undefined"
                >
                <p v-if="shownError('name')" :id="`${uid}-name-error`" class="mt-1.5 text-xs text-error">{{ shownError('name') }}</p>
              </div>
              <div>
                <label :for="`${uid}-phone`" class="mb-1.5 block text-sm font-semibold">Телефон</label>
                <input
                  :id="`${uid}-phone`"
                  v-model="form.contact.phone"
                  class="field-input"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="+7"
                  maxlength="32"
                  required
                  :aria-invalid="Boolean(shownError('phone'))"
                  :aria-describedby="shownError('phone') ? `${uid}-phone-error` : `${uid}-phone-hint`"
                >
                <p v-if="shownError('phone')" :id="`${uid}-phone-error`" class="mt-1.5 text-xs text-error">{{ shownError('phone') }}</p>
                <p v-else :id="`${uid}-phone-hint`" class="mt-1.5 text-xs text-muted">Нужен при любом способе связи</p>
              </div>
            </div>

            <fieldset :aria-describedby="shownError('channel') ? `${uid}-channel-error` : undefined">
              <legend class="mb-2 text-sm font-semibold">Как удобнее связаться</legend>
              <div class="flex flex-wrap gap-1.5">
                <label v-for="channel in CONTACT_CHANNELS" :key="channel" class="chip min-h-11!" :class="form.contact.channel === channel && 'is-selected'">
                  <input
                    v-model="form.contact.channel"
                    type="radio"
                    :name="`${uid}-channel`"
                    class="sr-only"
                    :value="channel"
                    :aria-invalid="Boolean(shownError('channel'))"
                  >
                  {{ CONTACT_CHANNEL_LABELS[channel] }}
                </label>
              </div>
              <p v-if="shownError('channel')" :id="`${uid}-channel-error`" class="mt-1.5 text-xs text-error">{{ shownError('channel') }}</p>
            </fieldset>

            <div v-if="form.contact.channel === 'telegram'">
              <label :for="`${uid}-telegram`" class="mb-1.5 block text-sm font-semibold">Username в Telegram</label>
              <input
                :id="`${uid}-telegram`"
                v-model="form.contact.telegram"
                class="field-input"
                type="text"
                autocapitalize="off"
                spellcheck="false"
                placeholder="@username"
                maxlength="40"
                :aria-invalid="Boolean(shownError('telegram'))"
                :aria-describedby="shownError('telegram') ? `${uid}-telegram-error` : undefined"
              >
              <p v-if="shownError('telegram')" :id="`${uid}-telegram-error`" class="mt-1.5 text-xs text-error">{{ shownError('telegram') }}</p>
            </div>

            <div v-if="form.contact.channel === 'email'">
              <label :for="`${uid}-email`" class="mb-1.5 block text-sm font-semibold">Email</label>
              <input
                :id="`${uid}-email`"
                v-model="form.contact.email"
                class="field-input"
                type="email"
                inputmode="email"
                autocomplete="email"
                maxlength="120"
                :aria-invalid="Boolean(shownError('email'))"
                :aria-describedby="shownError('email') ? `${uid}-email-error` : undefined"
              >
              <p v-if="shownError('email')" :id="`${uid}-email-error`" class="mt-1.5 text-xs text-error">{{ shownError('email') }}</p>
            </div>

            <div>
              <label :for="`${uid}-comment`" class="mb-1.5 block text-sm font-semibold">
                Комментарий <span class="font-normal text-muted">— необязательно</span>
              </label>
              <textarea :id="`${uid}-comment`" v-model="form.contact.comment" class="field-input min-h-24 resize-y" rows="3" maxlength="1500" />
            </div>

            <!-- Honeypot: off-screen, skipped by keyboard and screen readers. -->
            <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
              <label :for="`${uid}-website`">Сайт</label>
              <input :id="`${uid}-website`" v-model="honeypot" type="text" tabindex="-1" autocomplete="off">
            </div>

            <div>
              <label class="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  v-model="consent"
                  type="checkbox"
                  class="mt-0.5 size-5 shrink-0 accent-(--color-accent)"
                  :aria-invalid="Boolean(shownError('consent'))"
                  :aria-describedby="shownError('consent') ? `${uid}-consent-error` : undefined"
                >
                <span class="text-muted">
                  Согласен(на) на обработку персональных данных в соответствии с
                  <NuxtLink to="/privacy" target="_blank" class="text-text underline underline-offset-4 hover:text-accent">политикой</NuxtLink>
                </span>
              </label>
              <p v-if="shownError('consent')" :id="`${uid}-consent-error`" class="mt-1.5 text-xs text-error">{{ shownError('consent') }}</p>
            </div>
          </section>
        </div>

        <!-- ---------- Summary + send ---------- -->
        <aside class="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:col-span-5 lg:self-start">
          <div class="rounded-card bg-surface p-6 shadow-(--shadow-soft)">
            <p class="text-sm text-muted">{{ positionsLabel(items.length) }}</p>
            <p class="mt-2 flex flex-col">
              <span class="text-xs text-muted">Известная стоимость</span>
              <span class="text-[1.75rem] leading-tight font-semibold tabular-nums">
                {{ total.hasKnown ? formatRub(total.known) : 'Обсуждается' }}
              </span>
            </p>
            <p v-if="total.hasKnown && total.hasOnRequest" class="mt-1 text-sm text-muted">+ позиции с индивидуальным расчётом</p>
            <p v-if="total.hasDemo" class="mt-1 text-xs text-muted">Включает демо-цены — итог уточним при согласовании.</p>

            <div
              v-if="status.state === 'failed'"
              role="alert"
              class="mt-5 flex gap-2.5 rounded-card border border-error/30 bg-error/6 p-4 text-sm"
            >
              <AlertCircle class="mt-0.5 size-4 shrink-0 text-error" :stroke-width="2" aria-hidden="true" />
              <span>{{ failureText[status.reason] }}</span>
            </div>

            <BaseButton type="submit" size="lg" block class="mt-6" :disabled="status.state === 'sending'">
              <LoaderCircle v-if="status.state === 'sending'" class="size-4 animate-spin motion-reduce:animate-none" :stroke-width="2" aria-hidden="true" />
              {{ status.state === 'sending' ? 'Отправляем…' : status.state === 'failed' ? 'Отправить ещё раз' : 'Отправить заявку' }}
            </BaseButton>
            <p class="sr-only" role="status" aria-live="polite">{{ status.state === 'sending' ? 'Отправляем заявку' : '' }}</p>

            <div class="mt-5 flex gap-3 text-xs leading-relaxed text-muted">
              <Info class="mt-0.5 size-4 shrink-0" :stroke-width="1.75" aria-hidden="true" />
              <p>
                Заявка не бронирует дату. Мы свяжемся с вами, обсудим детали и подтвердим заказ вручную.
              </p>
            </div>
          </div>

          <button type="button" class="mt-3 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold underline-offset-[6px] hover:underline" @click="openDrawer">
            Открыть «Мою подборку»
          </button>
        </aside>
      </form>
    </template>
  </section>
</template>
