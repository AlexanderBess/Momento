<script setup lang="ts">
import { AlertCircle, Check, Copy, LoaderCircle } from '@lucide/vue'
import { findCoverColor, findTitleColor, titlePositions } from '~/config/photobook/covers'
import { findFormat, plural } from '~/config/photobook/formats'
import { extraOptions, findEndpaper, findPaperType } from '~/config/photobook/materials'
import { submitLead, type LeadResult } from '~/lib/leads'
import { effectiveExtras, serializeConfig } from '~/lib/photobook'

/**
 * Order request for the configured book: summary of the configuration + contact form.
 * The configuration is attached as structured data (serializeConfig). Success is shown only after
 * the endpoint confirmed delivery — with no endpoint configured the visitor is told so honestly.
 */
const { config, cover, preset, orderOpen } = usePhotobookStudio()
const price = usePhotobookPrice()
const runtime = useRuntimeConfig()
const route = useRoute()
const uid = useId()

/* ---------- Summary ---------- */

const summary = computed(() => {
  const c = config.value
  const format = findFormat(c.format)
  const extras = effectiveExtras(c)
  const spine = c.spineColor === 'match' ? 'в цвет обложки' : findCoverColor(c.coverType, c.spineColor).label.toLowerCase()
  const rows: { label: string; value: string }[] = [
    { label: 'Коллекция', value: preset.value.name },
    { label: 'Формат', value: `${format.label}, ${format.widthCm} × ${format.heightCm} см` },
    {
      label: 'Страницы',
      value: `${c.pageCount} ${plural(c.pageCount, ['страница', 'страницы', 'страниц'])} · ${c.spreads.length} ${plural(c.spreads.length, ['разворот', 'разворота', 'разворотов'])}`,
    },
    { label: 'Обложка', value: cover.value.label },
    { label: cover.value.usesPhoto ? 'Цвет корешка' : 'Цвет обложки', value: findCoverColor(c.coverType, c.coverColor).label },
    {
      label: 'Название',
      value:
        c.coverTitleEnabled && c.coverTitle.trim()
          ? `«${c.coverTitle.trim()}» · ${findTitleColor(c.coverType, c.coverTitleColor).label.toLowerCase()} · ${titlePositions.find((p) => p.id === c.coverTitlePosition)?.label.toLowerCase()}`
          : 'без названия',
    },
    { label: 'Бумага', value: `${findPaperType(c.paperType).label}` },
    { label: 'Форзац', value: findEndpaper(c.endpaperColor).label },
  ]
  if (cover.value.supportsSpineColor) rows.push({ label: 'Корешок', value: spine })
  const chosenExtras = extraOptions.filter((e) => extras[e.id]).map((e) => e.label.toLowerCase())
  rows.push({ label: 'Дополнительно', value: chosenExtras.length ? chosenExtras.join(', ') : 'нет' })
  rows.push({ label: 'Экземпляров', value: String(c.quantity) })
  return rows
})

const priceText = computed(() =>
  price.value.mode === 'estimate'
    ? `${formatRub(price.value.total)}${price.value.isDemo ? ' (примерно, демо-цены)' : ' (примерно)'}`
    : 'обсуждается',
)

/* ---------- Form ---------- */

const channels = ['Звонок', 'WhatsApp', 'Telegram', 'Email'] as const

const form = reactive({
  name: '',
  phone: '',
  email: '',
  channel: 'Звонок' as (typeof channels)[number],
  comment: '',
  consent: false,
})

const touched = ref(false)
const errors = computed(() => {
  const e: Partial<Record<'name' | 'phone' | 'email' | 'consent', string>> = {}
  if (form.name.trim().length < 2) e.name = 'Укажите, как к вам обращаться'
  if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Укажите телефон — минимум 10 цифр'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Проверьте адрес почты'
  if (form.channel === 'Email' && !form.email.trim()) e.email = 'Укажите почту, раз удобнее связаться по ней'
  if (!form.consent) e.consent = 'Нужно согласие на обработку данных'
  return e
})

type Status = { state: 'idle' | 'sending' | 'success' } | { state: 'failed'; reason: Exclude<LeadResult, { ok: true }>['reason'] }
const status = ref<Status>({ state: 'idle' })

const formEl = useTemplateRef<HTMLFormElement>('formEl')

async function submit() {
  touched.value = true
  if (Object.keys(errors.value).length) {
    await nextTick()
    formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  status.value = { state: 'sending' }
  const result = await submitLead(
    {
      service: 'photobook',
      contact: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        preferredChannel: form.channel,
        comment: form.comment.trim() || null,
      },
      payload: { configuration: serializeConfig(config.value), price: price.value },
      consent: { personalData: true, at: new Date().toISOString() },
      source: { page: route.fullPath },
    },
    runtime.public.leadsEndpoint as string,
  )
  status.value = result.ok ? { state: 'success' } : { state: 'failed', reason: result.reason }
}

/* Plain-text copy of the request — the honest fallback while online sending is not connected. */
const copied = ref(false)
async function copyRequest() {
  const lines = [
    'Заявка на фотокнигу MOMENTO',
    ...summary.value.map((row) => `${row.label}: ${row.value}`),
    `Стоимость: ${priceText.value}`,
    '',
    `Имя: ${form.name}`,
    `Телефон: ${form.phone}`,
    form.email && `Email: ${form.email}`,
    `Связаться: ${form.channel}`,
    form.comment && `Комментарий: ${form.comment}`,
  ].filter((line): line is string => typeof line === 'string')
  try {
    await navigator.clipboard.writeText(lines.join('\n'))
    copied.value = true
    setTimeout(() => (copied.value = false), 2500)
  } catch {
    copied.value = false
  }
}

watch(orderOpen, (open) => {
  if (open && status.value.state !== 'sending') status.value = { state: 'idle' }
  if (open) touched.value = false
})

const failureText: Record<Exclude<LeadResult, { ok: true }>['reason'], string> = {
  'not-configured':
    'Онлайн-отправка заявок пока не подключена, поэтому заявка не отправлена. Конфигурация сохранена на этой странице — скопируйте заявку целиком, чтобы передать её нам.',
  network: 'Не удалось связаться с сервером. Проверьте подключение к интернету и попробуйте ещё раз.',
  rejected: 'Сервер не принял заявку. Попробуйте ещё раз чуть позже.',
}
</script>

<template>
  <BaseDialog v-model:open="orderOpen" :title="status.state === 'success' ? 'Заявка отправлена' : 'Оформление заказа'" :hide-title="status.state === 'success'" size="lg">
    <!-- ---------- Success (only after a confirmed delivery) ---------- -->
    <div v-if="status.state === 'success'" class="flex flex-col items-center px-2 py-8 text-center sm:py-12">
      <div class="relative h-44 w-56" aria-hidden="true">
        <PhotobookCover :config="config" :fit="[0.7, 0.86]" sizes="200px" />
      </div>
      <span class="mt-4 inline-flex size-11 items-center justify-center rounded-full bg-success/12 text-success" aria-hidden="true">
        <Check class="size-5" :stroke-width="2" />
      </span>
      <p class="mt-5 max-w-md font-display text-h3">Ваша история начинает обретать форму</p>
      <p class="mt-3 max-w-md text-muted">
        Мы получили вашу конфигурацию и свяжемся с вами, чтобы обсудить детали изготовления.
      </p>
      <BaseButton class="mt-8" variant="secondary" @click="orderOpen = false">Вернуться к книге</BaseButton>
    </div>

    <!-- ---------- Form ---------- -->
    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-10">
      <!-- Configuration summary -->
      <section aria-labelledby="order-summary-title" class="flex flex-col gap-5">
        <div class="relative h-48 rounded-card bg-[radial-gradient(70%_70%_at_50%_45%,#fff,#ebe5dc)] sm:h-56">
          <PhotobookCover :config="config" :fit="[0.6, 0.78]" sizes="240px" />
        </div>
        <h3 id="order-summary-title" class="sr-only">Ваша фотокнига</h3>
        <dl class="divide-y divide-border text-sm">
          <div v-for="row in summary" :key="row.label" class="flex justify-between gap-4 py-2">
            <dt class="shrink-0 text-muted">{{ row.label }}</dt>
            <dd class="text-right font-medium">{{ row.value }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-4 pt-3">
            <dt class="font-semibold">Предварительная стоимость</dt>
            <dd class="text-right font-semibold tabular-nums">{{ priceText }}</dd>
          </div>
        </dl>
      </section>

      <!-- Contact form -->
      <form ref="formEl" class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <p class="text-sm text-muted">Оставьте контакты — мы согласуем макет, фотографии и сроки изготовления.</p>

        <div>
          <label :for="`${uid}-name`" class="mb-1.5 block text-sm font-semibold">Имя</label>
          <input
            :id="`${uid}-name`"
            v-model="form.name"
            class="field-input"
            type="text"
            autocomplete="name"
            required
            :aria-invalid="touched && Boolean(errors.name)"
            :aria-describedby="touched && errors.name ? `${uid}-name-error` : undefined"
          >
          <p v-if="touched && errors.name" :id="`${uid}-name-error`" class="mt-1.5 text-xs text-error">{{ errors.name }}</p>
        </div>

        <div>
          <label :for="`${uid}-phone`" class="mb-1.5 block text-sm font-semibold">Телефон</label>
          <input
            :id="`${uid}-phone`"
            v-model="form.phone"
            class="field-input"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="+7"
            required
            :aria-invalid="touched && Boolean(errors.phone)"
            :aria-describedby="touched && errors.phone ? `${uid}-phone-error` : undefined"
          >
          <p v-if="touched && errors.phone" :id="`${uid}-phone-error`" class="mt-1.5 text-xs text-error">{{ errors.phone }}</p>
        </div>

        <div>
          <label :for="`${uid}-email`" class="mb-1.5 block text-sm font-semibold">
            Email <span class="font-normal text-muted">— необязательно</span>
          </label>
          <input
            :id="`${uid}-email`"
            v-model="form.email"
            class="field-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            :aria-invalid="touched && Boolean(errors.email)"
            :aria-describedby="touched && errors.email ? `${uid}-email-error` : undefined"
          >
          <p v-if="touched && errors.email" :id="`${uid}-email-error`" class="mt-1.5 text-xs text-error">{{ errors.email }}</p>
        </div>

        <fieldset>
          <legend class="mb-2 text-sm font-semibold">Как удобнее связаться</legend>
          <div class="flex flex-wrap gap-1.5">
            <label v-for="channel in channels" :key="channel" class="chip" :class="form.channel === channel && 'is-selected'">
              <input v-model="form.channel" type="radio" :name="`${uid}-channel`" class="sr-only" :value="channel" >
              {{ channel }}
            </label>
          </div>
        </fieldset>

        <div>
          <label :for="`${uid}-comment`" class="mb-1.5 block text-sm font-semibold">
            Комментарий <span class="font-normal text-muted">— необязательно</span>
          </label>
          <textarea
            :id="`${uid}-comment`"
            v-model="form.comment"
            class="field-input min-h-24 resize-y"
            rows="3"
            maxlength="1000"
            placeholder="Сроки, повод, пожелания к оформлению"
          />
        </div>

        <div>
          <label class="flex cursor-pointer items-start gap-3 text-sm">
            <input
              v-model="form.consent"
              type="checkbox"
              class="mt-0.5 size-5 shrink-0 accent-(--color-accent)"
              :aria-invalid="touched && Boolean(errors.consent)"
              :aria-describedby="touched && errors.consent ? `${uid}-consent-error` : undefined"
            >
            <span class="text-muted">
              Согласен(на) на обработку персональных данных в соответствии с
              <NuxtLink to="/privacy" target="_blank" class="text-text underline underline-offset-4 hover:text-accent">политикой</NuxtLink>
            </span>
          </label>
          <p v-if="touched && errors.consent" :id="`${uid}-consent-error`" class="mt-1.5 text-xs text-error">{{ errors.consent }}</p>
        </div>

        <!-- Honest failure state -->
        <div
          v-if="status.state === 'failed'"
          role="alert"
          class="flex flex-col gap-3 rounded-card border border-error/30 bg-error/6 p-4 text-sm"
        >
          <p class="flex gap-2.5">
            <AlertCircle class="mt-0.5 size-4 shrink-0 text-error" :stroke-width="2" aria-hidden="true" />
            <span>{{ failureText[status.reason] }}</span>
          </p>
          <button
            v-if="status.reason === 'not-configured'"
            type="button"
            class="inline-flex min-h-10 items-center gap-2 self-start rounded-button bg-surface px-3.5 text-sm font-semibold ring-1 ring-border hover:ring-text/40"
            @click="copyRequest"
          >
            <component :is="copied ? Check : Copy" class="size-4" :stroke-width="2" aria-hidden="true" />
            {{ copied ? 'Скопировано' : 'Скопировать заявку' }}
          </button>
        </div>

        <BaseButton type="submit" size="lg" block :disabled="status.state === 'sending'" class="mt-1">
          <LoaderCircle v-if="status.state === 'sending'" class="size-4 animate-spin" :stroke-width="2" aria-hidden="true" />
          {{ status.state === 'sending' ? 'Отправляем…' : 'Отправить заявку' }}
        </BaseButton>
        <p class="text-center text-xs text-muted">Заявка ни к чему не обязывает — сначала мы обсудим детали.</p>
      </form>
    </div>
  </BaseDialog>
</template>
