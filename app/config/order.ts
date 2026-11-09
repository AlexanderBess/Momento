import type { ServiceSlug } from '~/types/service'
import { services } from './services'

/**
 * Shared contract for links into the order flow (`/order`).
 *
 * Service pages never build their own forms — they link to `/order` with query params:
 *   /order?service=booth&event=corporate
 * The future order form (and cart) read the same params via `parseOrderQuery`.
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

export interface OrderPrefill {
  service?: ServiceSlug
  event?: EventType
}

export function buildOrderLink({ service, event }: OrderPrefill = {}): string {
  const params = new URLSearchParams()
  if (service) params.set('service', service)
  if (event) params.set('event', event)
  const query = params.toString()
  return query ? `/order?${query}` : '/order'
}

function first(value: unknown): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : undefined
}

/** Validates raw route query — unknown values are dropped, never trusted. */
export function parseOrderQuery(query: Record<string, unknown>): OrderPrefill {
  const service = first(query.service)
  const event = first(query.event)
  return {
    service: services.some((s) => s.slug === service) ? (service as ServiceSlug) : undefined,
    event: eventTypes.includes(event as EventType) ? (event as EventType) : undefined,
  }
}
