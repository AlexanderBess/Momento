import type { ServiceSlug } from '~/types/service'
import { photographyOrderOptions } from './photography'
import { findService, services } from './services'

/**
 * Shared contract for links into the order flow (`/order`).
 *
 * Service pages never build their own forms — they link to `/order` with query params:
 *   /order?service=booth&event=corporate
 *   /order?service=photography&package=standard&extras=extra-hour,photobook&bundle=booth,photozones
 * The future order form (and cart) read the same params via `parseOrderQuery`.
 * Every combination becomes one request with one manual confirmation — a date is never shown
 * as booked before that.
 */

export type EventType = 'wedding' | 'birthday' | 'private' | 'corporate' | 'brand'

export const eventTypeLabels: Record<EventType, string> = {
  wedding: 'Свадьба',
  birthday: 'День рождения',
  private: 'Частное мероприятие',
  corporate: 'Корпоративное мероприятие',
  brand: 'Бренд-мероприятие',
}

export const eventTypes = Object.keys(eventTypeLabels) as EventType[]

/** Orderable options of a service (id → label). Unknown ids in a link are dropped. */
export interface ServiceOrderOptions {
  packages: Record<string, string>
  extras: Record<string, string>
  directions: Record<string, string>
}

const serviceOrderOptions: Partial<Record<ServiceSlug, ServiceOrderOptions>> = {
  photography: photographyOrderOptions,
}

export interface OrderPrefill {
  service?: ServiceSlug
  event?: EventType
  /** Service-specific package id (see serviceOrderOptions). */
  package?: string
  /** Service-specific add-on ids. */
  extras?: string[]
  /** Service-specific direction, e.g. photography → 'family'. */
  direction?: string
  /** Other services requested together with `service` in the same order. */
  bundle?: ServiceSlug[]
}

export function buildOrderLink({ service, event, package: pkg, extras, direction, bundle }: OrderPrefill = {}): string {
  const params = new URLSearchParams()
  if (service) params.set('service', service)
  if (event) params.set('event', event)
  if (pkg) params.set('package', pkg)
  if (extras?.length) params.set('extras', extras.join(','))
  if (direction) params.set('direction', direction)
  if (bundle?.length) params.set('bundle', bundle.join(','))
  // Keep commas readable in the URL (they are valid in a query string).
  const query = params.toString().replaceAll('%2C', ',')
  return query ? `/order?${query}` : '/order'
}

function first(value: unknown): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : undefined
}

function list(value: unknown): string[] {
  return [...new Set((first(value) ?? '').split(',').map((v) => v.trim()).filter(Boolean))]
}

const isService = (slug: string | undefined): slug is ServiceSlug => services.some((s) => s.slug === slug)

/** Validates raw route query — unknown values are dropped, never trusted. */
export function parseOrderQuery(query: Record<string, unknown>): OrderPrefill {
  const rawService = first(query.service)
  const service = isService(rawService) ? rawService : undefined
  const event = first(query.event)
  const options = service ? serviceOrderOptions[service] : undefined
  const pkg = first(query.package)
  const direction = first(query.direction)
  const extras = options ? list(query.extras).filter((id) => id in options.extras) : []
  const bundle = list(query.bundle).filter((slug): slug is ServiceSlug => isService(slug) && slug !== service)

  return {
    service,
    event: eventTypes.includes(event as EventType) ? (event as EventType) : undefined,
    package: options && pkg && pkg in options.packages ? pkg : undefined,
    extras: extras.length ? extras : undefined,
    direction: options && direction && direction in options.directions ? direction : undefined,
    bundle: bundle.length ? bundle : undefined,
  }
}

/** Human-readable lines for a (validated) prefill — for the order form summary. */
export function describeOrder(prefill: OrderPrefill): string[] {
  const { service, event, package: pkg, extras, direction, bundle } = prefill
  const options = service ? serviceOrderOptions[service] : undefined
  return [
    service && findService(service)?.title,
    direction && options?.directions[direction],
    pkg && `пакет ${options?.packages[pkg]}`,
    extras?.length && `дополнительно: ${extras.map((id) => options?.extras[id]).join(', ')}`,
    bundle?.length && `вместе с: ${bundle.map((slug) => findService(slug)?.title).join(', ')}`,
    event && eventTypeLabels[event],
  ].filter((part): part is string => Boolean(part))
}
