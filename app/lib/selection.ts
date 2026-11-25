import type { CartItem, CartItemInput } from '~/types/cart'
import type { PhotobookConfig } from '~/types/photobook'
import { findPreset } from '~/config/photobook/presets'
import {
  normalizePhotobookRequestPrice,
  PHOTOBOOK_QUOTE_LABEL,
  photobookCollectionDetails,
  photobookCollectionOrder,
  type PhotobookCollectionPreferences,
} from '#shared/photobookCollection'
import { photobookGuideDetails, photobookGuideOrder, type PhotobookGuideOptions } from '#shared/photobookGuide'
import { graduationOrderDetails, type GraduationOrder } from '#shared/graduationPhotobook'
import { boothCustomization } from '~/config/booth'
import { eventTypeLabels, eventTypes, type EventType } from '~/config/order'
import {
  photographyExtras,
  photographyMainFormats,
  photographyMoreFormats,
  photographyPackages,
  type PhotographyExtraId,
  type PhotographyFormatId,
  type PhotographyPackageId,
} from '~/config/photography'
import {
  findConcept,
  findOption,
  photozoneOptions,
  photozonePricing,
  type PhotozoneConcept,
  type PhotozoneOptionId,
} from '~/config/photozones'
import { calculatePrice } from '~/composables/usePhotobookPrice'
import { describePhotobook, serializeConfig } from '~/lib/photobook'

/**
 * Builders of selection positions — one per service, pure functions (no Vue state).
 * Service pages, the editors in «Моя подборка» and Book Studio all build positions here, so a
 * position always looks the same no matter where it was created or edited.
 *
 * Each service keeps its own structured `config`; readers below validate a stored config (it comes
 * from localStorage and may be stale) and fall back to safe defaults.
 */

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [])

/* ---------- AI photo booth (one position) ---------- */

export type BoothDesignId = (typeof boothCustomization)[number]['id']

export interface BoothConfig {
  /** Optional: what the booth is for (the request form also asks for the event type). */
  eventType: EventType | null
  /** Design wishes from the customization section; terms are agreed later. */
  design: BoothDesignId[]
}

export const emptyBoothConfig = (): BoothConfig => ({ eventType: null, design: [] })

export function readBoothConfig(config: Record<string, unknown>): BoothConfig {
  const eventType = eventTypes.includes(config.eventType as EventType) ? (config.eventType as EventType) : null
  const design = boothCustomization.map((o) => o.id).filter((id) => strings(config.design).includes(id))
  return { eventType, design }
}

export function boothItem(config: BoothConfig): CartItemInput {
  const design = boothCustomization.filter((o) => config.design.includes(o.id))
  return {
    key: 'booth',
    service: 'booth',
    title: 'AI-фотобудка',
    subtitle: 'Аренда с доставкой и установкой',
    details: [
      config.eventType ? eventTypeLabels[config.eventType] : 'Тип мероприятия не указан',
      ...(design.length ? design.map((o) => o.label) : ['Оформление обсудим']),
    ],
    price: null,
    quantity: 1,
    config: { eventType: config.eventType, design: design.map((o) => o.id) },
    href: '/services/booth#booking',
  }
}

/* ---------- Photography (one position) ---------- */

export interface PhotographyConfig {
  package: PhotographyPackageId | null
  extras: PhotographyExtraId[]
  direction: PhotographyFormatId | null
}

export const emptyPhotographyConfig = (): PhotographyConfig => ({ package: null, extras: [], direction: null })

export const photographyDirections = [...photographyMainFormats, ...photographyMoreFormats]
export const availablePhotographyExtras = photographyExtras.filter((e) => e.available)

export function readPhotographyConfig(config: Record<string, unknown>): PhotographyConfig {
  const pkg = photographyPackages.find((p) => p.id === config.package)?.id ?? null
  const direction = photographyDirections.find((d) => d.id === config.direction)?.id ?? null
  const extras = availablePhotographyExtras.map((e) => e.id).filter((id) => strings(config.extras).includes(id))
  return { package: pkg, extras, direction }
}

export function photographyItem(config: PhotographyConfig): CartItemInput {
  const pkg = photographyPackages.find((p) => p.id === config.package)
  const direction = photographyDirections.find((d) => d.id === config.direction)
  const extras = availablePhotographyExtras.filter((e) => config.extras.includes(e.id))
  // Known price only when the package and every chosen add-on have a fixed price.
  const prices = [pkg?.price ?? null, ...extras.map((e) => e.price)]
  const known = pkg && pkg.price !== null ? prices.reduce<number>((sum, p) => sum + (p ?? 0), 0) : null
  return {
    key: 'photography',
    service: 'photography',
    title: 'Фотосъёмка',
    subtitle: direction ? `${direction.title} · ${direction.label.toLowerCase()}` : 'Направление обсудим',
    details: [
      pkg ? `Пакет ${pkg.name} — ${pkg.title}` : 'Пакет подберём вместе',
      ...extras.map((e) => e.title),
    ],
    price: known,
    pricePartial: known !== null && extras.some((e) => e.price === null),
    quantity: 1,
    config: { package: pkg?.id ?? null, extras: extras.map((e) => e.id), direction: direction?.id ?? null },
    href: '/services/photography#pricing',
  }
}

/* ---------- Photo zones (several positions) ---------- */

export const photozoneReadyKey = (conceptId: string) => `photozones:ready:${conceptId}`
export const PHOTOZONE_CUSTOM_KEY = 'photozones:custom'

export type PhotozoneConfig =
  | { orderType: 'ready'; conceptId: string; options: PhotozoneOptionId[] }
  | { orderType: 'custom'; conceptId: null; options: []; notes: string }

export function readPhotozoneConfig(config: Record<string, unknown>): PhotozoneConfig | null {
  if (config.orderType === 'custom') {
    return { orderType: 'custom', conceptId: null, options: [], notes: typeof config.notes === 'string' ? config.notes : '' }
  }
  if (config.orderType === 'ready' && typeof config.conceptId === 'string' && findConcept(config.conceptId)) {
    const options = photozoneOptions.map((o) => o.id).filter((id) => strings(config.options).includes(id))
    return { orderType: 'ready', conceptId: config.conceptId, options }
  }
  return null
}

/** Price of a concept with options: known sum + whether some part is «обсуждается». */
export function photozonePrice(concept: PhotozoneConcept, options: PhotozoneOptionId[]) {
  const chosen = photozoneOptions.filter((o) => options.includes(o.id))
  const partial = chosen.some((o) => o.price === null)
  const total =
    concept.basePrice === null ? null : concept.basePrice + chosen.reduce((sum, o) => sum + (o.price ?? 0), 0)
  return { total, partial, isDemo: photozonePricing.isDemo }
}

export function photozoneReadyItem(concept: PhotozoneConcept, options: PhotozoneOptionId[]): CartItemInput {
  // Options in catalogue order, so the same choice always serialises the same way.
  const ordered = photozoneOptions.filter((o) => options.includes(o.id)).map((o) => o.id)
  const price = photozonePrice(concept, ordered)
  return {
    key: photozoneReadyKey(concept.id),
    service: 'photozones',
    title: `Фотозоны — «${concept.title}»`,
    subtitle: 'Готовая фотозона · аренда с доставкой, монтажом и демонтажом',
    details: ordered.length ? ordered.map((id) => findOption(id)!.label) : ['Без дополнительных опций'],
    price: price.total,
    pricePartial: price.partial,
    priceIsDemo: price.total !== null && price.isDemo,
    quantity: 1,
    config: { orderType: 'ready', conceptId: concept.id, options: ordered },
    href: '/services/photozones#collection',
  }
}

export function photozoneCustomItem(notes = ''): CartItemInput {
  const text = notes.trim()
  return {
    key: PHOTOZONE_CUSTOM_KEY,
    service: 'photozones',
    title: 'Фотозоны — индивидуальный проект',
    subtitle: 'Оформление под ваше мероприятие · доставка, монтаж и демонтаж',
    details: [text ? `Идея: ${text.length > 90 ? `${text.slice(0, 90)}…` : text}` : 'Концепцию и комплектацию согласуем вместе'],
    price: null,
    quantity: 1,
    config: { orderType: 'custom', conceptId: null, options: [], notes: text },
    href: '/services/photozones#custom',
  }
}

export function photozoneItem(config: PhotozoneConfig): CartItemInput | null {
  if (config.orderType === 'custom') return photozoneCustomItem(config.notes)
  const concept = findConcept(config.conceptId)
  return concept ? photozoneReadyItem(concept, config.options) : null
}

/* ---------- Photobooks (several positions, one per Book Studio project) ---------- */

export const photobookKey = (projectId: string) => `photobooks:${projectId}`
export const photobookCollectionKey = (presetId: PhotobookCollectionPreferences['presetId']) => `photobooks:collection:${presetId}`

export function photobookCollectionItem(preferences: PhotobookCollectionPreferences): CartItemInput {
  const order = photobookCollectionOrder(preferences)
  return {
    key: photobookCollectionKey(order.presetId),
    service: 'photobooks',
    title: `Фотокнига «${findPreset(order.presetId).name}»`,
    details: photobookCollectionDetails(order),
    price: null,
    quantity: 1,
    config: { ...order },
    href: '/services/photobooks/personal#collections',
  }
}

export function photobookGuideItem(options: PhotobookGuideOptions, desiredDeliveryDate?: string): CartItemInput {
  const order = photobookGuideOrder(options, desiredDeliveryDate)
  return {
    key: `photobooks:individual:${options.format}:${options.pageCount}:${options.coverType}:${options.coverColor}`,
    service: 'photobooks',
    title: 'Индивидуальная фотокнига',
    details: photobookGuideDetails(order),
    price: null,
    quantity: 1,
    config: { ...order },
    href: '/services/photobooks/personal#book-guide',
  }
}

export function graduationPhotobookItem(order: GraduationOrder): CartItemInput {
  const { institutionType, templateId, children, additionalCopies, photography, desiredDeliveryDate, preferredPhotographyDate } = order
  return {
    key: ['photobooks', 'graduation', institutionType, templateId, children, additionalCopies, photography, desiredDeliveryDate, preferredPhotographyDate].join(':'),
    service: 'photobooks',
    title: 'Выпускные альбомы',
    details: graduationOrderDetails(order),
    price: null,
    quantity: 1,
    config: { ...order },
    href: '/services/photobooks/graduation#graduation-calculator',
  }
}

export interface PhotobookItemConfig {
  projectId: string
  layoutComplete: boolean
  /** Snapshot of the project at the last sync (serializeConfig) — what the request carries. */
  book: ReturnType<typeof serializeConfig>
}

export function readPhotobookItemConfig(config: Record<string, unknown>): { projectId: string; layoutComplete: boolean } | null {
  return typeof config.projectId === 'string'
    ? { projectId: config.projectId, layoutComplete: config.layoutComplete === true }
    : null
}

export function photobookItem(project: { id: string; config: PhotobookConfig; layoutComplete: boolean }): CartItemInput {
  const { config } = project
  const price = calculatePrice(config)
  const rows = describePhotobook(config)
  const pick = (label: string) => rows.find((r) => r.label === label)?.value
  const title = config.coverTitleEnabled && config.coverTitle.trim() ? `Фотокнига «${config.coverTitle.trim()}»` : 'Фотокнига'
  return normalizePhotobookRequestPrice({
    key: photobookKey(project.id),
    service: 'photobooks',
    title,
    subtitle: `Коллекция ${pick('Коллекция')}`,
    details: [
      pick('Формат'),
      pick('Страницы')?.split(' · ')[0],
      `Обложка: ${pick('Обложка')?.toLowerCase()}, ${(pick('Цвет обложки') ?? pick('Цвет корешка'))?.toLowerCase()}`,
      `Бумага: ${pick('Бумага')?.toLowerCase()}`,
    ].filter((d): d is string => Boolean(d)),
    status: project.layoutComplete ? 'Макет готов' : 'Макет не завершён',
    price: price.mode === 'estimate' ? price.unit : null,
    priceIsDemo: price.mode === 'estimate' && price.isDemo,
    quantity: config.quantity,
    config: { projectId: project.id, layoutComplete: project.layoutComplete, book: serializeConfig(config) } satisfies PhotobookItemConfig,
    href: `/services/photobooks?project=${encodeURIComponent(project.id)}#studio`,
  })
}

/* ---------- Generic ---------- */

/** Rebuilds a non-photobook position from its stored config (used to check what an editor would save). */
export function rebuildItem(item: CartItem): CartItemInput | null {
  switch (item.service) {
    case 'booth':
      return boothItem(readBoothConfig(item.config))
    case 'photography':
      return photographyItem(readPhotographyConfig(item.config))
    case 'photozones': {
      const config = readPhotozoneConfig(item.config)
      return config ? photozoneItem(config) : null
    }
    default:
      return null
  }
}

/** «Обсуждается» / «18 000 ₽» / «18 000 ₽ + обсуждается». */
export function priceText(item: Pick<CartItem, 'service' | 'price' | 'pricePartial'>): string {
  if (item.price === null) return item.service === 'photobooks' ? PHOTOBOOK_QUOTE_LABEL : 'Обсуждается'
  return `${formatRub(item.price)}${item.pricePartial ? ' + обсуждается' : ''}`
}

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
function formatRub(amount: number) {
  return rub.format(amount)
}

export const positionsLabel = (n: number) =>
  `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'позиция' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'позиции' : 'позиций'}`
