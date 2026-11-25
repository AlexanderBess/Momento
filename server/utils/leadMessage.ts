import {
  CONTACT_CHANNEL_LABELS,
  CONTACT_CHANNELS,
  LEAD_EVENT_TYPES,
  LIMITS,
  type LeadItem,
  type LeadRequest,
} from '#shared/lead'
import {
  normalizePhotobookRequestPrice,
  photobookCollectionDetails,
  readPhotobookCollectionOrder,
} from '#shared/photobookCollection'
import { INDIVIDUAL_PHOTOBOOK_ORDER, photobookGuideDetails, readPhotobookGuideOrder } from '#shared/photobookGuide'
import { GRADUATION_PHOTOBOOK_ORDER, graduationOrderDetails, readGraduationOrder } from '#shared/graduationPhotobook'
import { findPreset } from '../../app/config/photobook/presets'

/**
 * Turning an untrusted request body into a clean LeadRequest, and a LeadRequest into the text of
 * the Telegram message for the MOMENTO work chat.
 */

const SERVICES = ['booth', 'photography', 'photozones', 'photobooks'] as const

const str = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '')
const optStr = (value: unknown, max: number): string | null => str(value, max) || null

/** Coerces every field to its type and length limit; unknown fields are dropped. */
export function sanitizeLead(body: unknown): LeadRequest | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const contact = (b.contact ?? {}) as Record<string, unknown>
  const event = (b.event ?? {}) as Record<string, unknown>
  const rawItems = Array.isArray(b.items) ? b.items.slice(0, LIMITS.items) : []

  const items: LeadItem[] = rawItems
    .filter((i): i is Record<string, unknown> => Boolean(i) && typeof i === 'object')
    .filter((i) => SERVICES.includes(i.service as (typeof SERVICES)[number]))
    .map((i) => ({
      id: str(i.id, 64),
      service: i.service as LeadItem['service'],
      title: str(i.title, LIMITS.text),
      subtitle: optStr(i.subtitle, LIMITS.text),
      details: (Array.isArray(i.details) ? i.details : []).slice(0, LIMITS.details).map((d) => str(d, LIMITS.text)).filter(Boolean),
      status: optStr(i.status, 60),
      price: typeof i.price === 'number' && Number.isFinite(i.price) && i.price >= 0 ? Math.round(i.price) : null,
      pricePartial: i.pricePartial === true,
      priceIsDemo: i.priceIsDemo === true,
      quantity: Number.isInteger(i.quantity) && (i.quantity as number) > 0 ? Math.min(i.quantity as number, 99) : 1,
      config: i.config && typeof i.config === 'object' ? (i.config as Record<string, unknown>) : {},
    }))

  const channel = CONTACT_CHANNELS.find((c) => c === contact.channel) ?? ('' as LeadRequest['contact']['channel'])
  const eventType = LEAD_EVENT_TYPES.find((t) => t === event.type) ?? null

  return {
    idempotencyKey: str(b.idempotencyKey, 80),
    items,
    event: {
      type: eventType,
      date: optStr(event.date, 10),
      time: optStr(event.time, 5),
      duration: optStr(event.duration, LIMITS.text),
      venue: optStr(event.venue, LIMITS.text),
      wishes: optStr(event.wishes, LIMITS.long),
    },
    contact: {
      name: str(contact.name, LIMITS.name),
      phone: str(contact.phone, LIMITS.phone),
      channel,
      telegram: optStr(contact.telegram, 40),
      email: optStr(contact.email, 120),
      comment: optStr(contact.comment, LIMITS.long),
    },
    consent: { personalData: true, at: str((b.consent as Record<string, unknown> | undefined)?.at, 40) },
    source: { page: str((b.source as Record<string, unknown> | undefined)?.page, 300) },
    website: str(b.website, 200),
  }
}

/** Keep the legacy project shape and rebuild commercial photobook lines from the catalog. */
export function preparePhotobookLeadItems(items: LeadItem[]): LeadItem[] | null {
  const prepared: LeadItem[] = []
  for (const item of items) {
    const { config } = item
    const commercial = ['orderType', 'presetId', 'specification', 'templateId', 'institutionType'].some((key) => key in config)
    if (item.service !== 'photobooks' || !commercial) {
      prepared.push(normalizePhotobookRequestPrice(item))
      continue
    }
    const order = config.orderType === GRADUATION_PHOTOBOOK_ORDER
      ? readGraduationOrder(config)
      : config.orderType === INDIVIDUAL_PHOTOBOOK_ORDER
        ? readPhotobookGuideOrder(config)
        : readPhotobookCollectionOrder(config)
    if (!order) return null
    const individual = order.orderType === INDIVIDUAL_PHOTOBOOK_ORDER
    const graduation = order.orderType === GRADUATION_PHOTOBOOK_ORDER
    prepared.push({
      ...item,
      title: graduation ? 'Выпускные альбомы' : 'Персональная фотокнига',
      subtitle: graduation ? 'Групповой заказ' : individual ? 'Индивидуальные параметры' : `Коллекция: ${findPreset(order.presetId).name}`,
      details: graduation ? graduationOrderDetails(order) : individual ? photobookGuideDetails(order) : photobookCollectionDetails(order),
      status: null,
      price: null,
      pricePartial: false,
      priceIsDemo: false,
      quantity: 1,
      config: { ...order },
    })
  }
  return prepared
}

const escapeHtml = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money = (n: number) => `${rub.format(n)} ₽`

const EVENT_LABELS: Record<string, string> = {
  wedding: 'Свадьба',
  birthday: 'День рождения',
  private: 'Частное мероприятие',
  corporate: 'Корпоративное мероприятие',
  brand: 'Бренд-мероприятие',
  other: 'Другое',
}

const SERVICE_LABELS: Record<string, string> = {
  booth: 'AI-фотобудка',
  photography: 'Фотосъёмка',
  photozones: 'Фотозоны',
  photobooks: 'Фотокниги',
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

/** Message blocks (each one stays whole when the text is split into Telegram-sized parts). */
export function leadMessageBlocks(lead: LeadRequest, requestNumber: string): string[] {
  const e = escapeHtml
  const { contact, event } = lead
  const blocks: string[] = []

  const contactLines = [
    `<b>Новая заявка ${e(requestNumber)}</b>`,
    'Не бронирование — нужно связаться с клиентом.',
    '',
    `<b>Контакты</b>`,
    `Имя: ${e(contact.name)}`,
    `Телефон: ${e(contact.phone)}`,
    `Связаться: ${CONTACT_CHANNEL_LABELS[contact.channel]}`,
    contact.telegram && `Telegram: ${e(contact.telegram.startsWith('@') ? contact.telegram : `@${contact.telegram}`)}`,
    contact.email && `Email: ${e(contact.email)}`,
    contact.comment && `Комментарий: ${e(contact.comment)}`,
  ]
  blocks.push(contactLines.filter((line): line is string => typeof line === 'string').join('\n'))

  const eventLines = [
    event.type && `Тип: ${EVENT_LABELS[event.type]}`,
    event.date && `Дата: ${formatDate(event.date)}`,
    event.time && `Время: ${e(event.time)}`,
    event.duration && `Длительность: ${e(event.duration)}`,
    event.venue && `Место: ${e(event.venue)}`,
    event.wishes && `Пожелания: ${e(event.wishes)}`,
  ].filter(Boolean)
  blocks.push(`<b>О мероприятии</b>\n${eventLines.length ? eventLines.join('\n') : 'не указано'}`)

  blocks.push(`<b>Состав заявки (${lead.items.length})</b>`)
  lead.items.forEach((item, index) => {
    const price =
      item.price === null
        ? item.service === 'photobooks' ? 'рассчитывается индивидуально' : 'обсуждается'
        : `${money(item.price)}${item.pricePartial ? ' + обсуждается' : ''}${item.priceIsDemo ? ' (демо-цена)' : ''}`
    const lines = [
      `${index + 1}. <b>${e(item.title)}</b> — ${SERVICE_LABELS[item.service]}`,
      item.subtitle && `   ${e(item.subtitle)}`,
      ...item.details.map((d) => `   • ${e(d)}`),
      item.status && `   Статус: ${e(item.status)}`,
      item.service === 'photobooks' && typeof item.config.projectId === 'string' && `   Проект: ${e(item.config.projectId)}`,
      `   ${item.service === 'photobooks' ? 'Стоимость' : 'Цена'}: ${price}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`,
    ]
    blocks.push(lines.filter(Boolean).join('\n'))
  })

  const priced = lead.items.filter((i) => i.price !== null)
  const known = priced.reduce((sum, i) => sum + i.price! * i.quantity, 0)
  const onRequest = lead.items.some((i) => i.price === null || i.pricePartial)
  const demo = priced.some((i) => i.priceIsDemo)
  blocks.push(
    `<b>Предварительно:</b> ${priced.length ? money(known) : 'обсуждается'}${priced.length && onRequest ? ' + позиции с индивидуальным расчётом' : ''}${demo ? '\nВключает демо-цены — итог согласовать с клиентом.' : ''}`,
  )

  blocks.push(`<i>Страница: ${e(lead.source.page || '—')}</i>`)
  return blocks
}

/** Joins blocks into messages under Telegram's 4096-character limit. */
export function splitMessages(blocks: string[], limit = 3800): string[] {
  const messages: string[] = []
  let current = ''
  for (const block of blocks) {
    const piece = block.length > limit ? `${block.slice(0, limit - 1)}…` : block
    if (current && current.length + piece.length + 2 > limit) {
      messages.push(current)
      current = piece
    } else {
      current = current ? `${current}\n\n${piece}` : piece
    }
  }
  if (current) messages.push(current)
  return messages
}
