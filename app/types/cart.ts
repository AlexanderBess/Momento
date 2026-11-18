import type { ServiceSlug } from './service'

/**
 * One position of the shared MOMENTO request (the cart at /checkout).
 *
 * Every service page adds its positions through `useCart().add()` — there is no per-service cart.
 * Event date, time and venue are not part of a position: they belong to the whole request and are
 * collected once by the order form.
 */
export interface CartItem {
  /**
   * Identity of the position. Adding an item whose key is already in the cart updates that position
   * instead of creating a duplicate; different keys are separate positions. Services choose what
   * makes two configurations "the same" (e.g. photo zones: one position per concept).
   */
  key: string
  service: ServiceSlug
  /** Main line, e.g. «Фотозона «Шалфейная арка»». */
  title: string
  /** Kind of the position, e.g. «Готовая фотозона» / «Индивидуальный проект». */
  subtitle?: string
  /** Human-readable chosen options. */
  details: string[]
  /** Fixed price of one unit in RUB; `null` → calculated individually («Обсуждается»). */
  price: number | null
  /** Part of the configuration has no fixed price (e.g. an add-on «обсуждается»): `price` is the known part. */
  pricePartial?: boolean
  /** The figure is a demo value, not a confirmed commercial price. */
  priceIsDemo?: boolean
  quantity: number
  /**
   * Structured, service-specific configuration that goes into the request as is,
   * e.g. `{ orderType: 'ready', conceptId: 'sage-arch', options: ['neon-sign'] }`.
   */
  config: Record<string, unknown>
  /** Page to go back to for changes. */
  href?: string
  /** ms timestamp of the last add / update. */
  updatedAt: number
}

export type CartAddResult = 'added' | 'updated' | 'unchanged'
