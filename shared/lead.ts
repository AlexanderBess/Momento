/**
 * Contract of a MOMENTO request (lead) — shared by the request form (app) and the endpoint
 * (server/api/leads.post.ts). The same validation runs on both sides; the server never trusts the
 * client's checks.
 *
 * A request is not a booking: the team contacts the client and agrees everything manually.
 */

export const CONTACT_CHANNELS = ['call', 'whatsapp', 'telegram', 'email'] as const
export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  call: 'Звонок',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email',
}

export const LEAD_EVENT_TYPES = ['wedding', 'birthday', 'private', 'corporate', 'brand', 'other'] as const
export type LeadEventType = (typeof LEAD_EVENT_TYPES)[number]

export interface LeadItem {
  /** Position id in «Моя подборка». */
  id: string
  service: 'booth' | 'photography' | 'photozones' | 'photobooks'
  title: string
  subtitle: string | null
  details: string[]
  status: string | null
  /** Unit price snapshot shown to the client; `null` → «обсуждается». Not a commercial offer. */
  price: number | null
  pricePartial: boolean
  priceIsDemo: boolean
  quantity: number
  /** Service-specific structured configuration. */
  config: Record<string, unknown>
}

export interface LeadEvent {
  type: LeadEventType | null
  /** YYYY-MM-DD */
  date: string | null
  /** HH:MM */
  time: string | null
  duration: string | null
  venue: string | null
  wishes: string | null
}

export interface LeadContact {
  name: string
  phone: string
  channel: ContactChannel
  telegram: string | null
  email: string | null
  comment: string | null
}

export interface LeadRequest {
  /**
   * Random key of this submission, reused for retries of the same request: the server delivers a
   * request with a given key at most once. It is not a request number — that comes from the server.
   */
  idempotencyKey: string
  items: LeadItem[]
  event: LeadEvent
  contact: LeadContact
  consent: { personalData: true; at: string }
  source: { page: string }
  /** Honeypot — real visitors never fill it. */
  website?: string
}

export type LeadFailureReason = 'not-configured' | 'invalid' | 'delivery-failed' | 'network' | 'rejected'

export type LeadResponse =
  | { ok: true; requestNumber: string }
  | { ok: false; reason: LeadFailureReason; fields?: Partial<Record<LeadField, string>> }

export type LeadField = 'items' | 'name' | 'phone' | 'channel' | 'telegram' | 'email' | 'consent' | 'date' | 'time'

export const LIMITS = {
  items: 30,
  name: 80,
  phone: 32,
  text: 200,
  long: 1500,
  details: 20,
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{5,32}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const phoneDigits = (phone: string) => phone.replace(/\D/g, '')

/** Local date YYYY-MM-DD (for «no past dates»). */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Field errors of a request (Russian messages, shown next to the fields).
 * `today` lets the server allow «yesterday» for clients in an earlier time zone.
 */
export function validateLead(
  input: Pick<LeadRequest, 'items' | 'event' | 'contact'> & { consent: boolean },
  today = todayIso(),
): Partial<Record<LeadField, string>> {
  const e: Partial<Record<LeadField, string>> = {}
  const { contact, event } = input

  if (!input.items.length) e.items = 'Добавьте в заявку хотя бы одну услугу'
  if (contact.name.trim().length < 2) e.name = 'Укажите, как к вам обращаться'
  const digits = phoneDigits(contact.phone)
  if (!digits) e.phone = 'Укажите телефон — он нужен при любом способе связи'
  else if (digits.length < 10 || digits.length > 15) e.phone = 'Проверьте номер: нужно от 10 до 15 цифр'
  if (!CONTACT_CHANNELS.includes(contact.channel)) e.channel = 'Выберите, как с вами связаться'
  if (contact.channel === 'telegram') {
    if (!contact.telegram?.trim()) e.telegram = 'Укажите username в Telegram'
    else if (!TELEGRAM_RE.test(contact.telegram.trim())) e.telegram = 'Username: 5–32 символа — латиница, цифры и «_»'
  }
  if (contact.channel === 'email') {
    if (!contact.email?.trim()) e.email = 'Укажите email'
    else if (!EMAIL_RE.test(contact.email.trim())) e.email = 'Проверьте адрес почты'
  }
  if (!input.consent) e.consent = 'Нужно согласие на обработку персональных данных'
  if (event.date) {
    if (!DATE_RE.test(event.date)) e.date = 'Проверьте дату'
    else if (event.date < today) e.date = 'Дата уже прошла'
  }
  if (event.time && !TIME_RE.test(event.time)) e.time = 'Проверьте время'
  return e
}
