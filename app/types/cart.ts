import type { ServiceSlug } from './service'

/**
 * One position of the shared MOMENTO selection («Моя подборка»).
 *
 * Every service adds its positions through `useCart().add()` — there is no per-service cart.
 * Event date, time and venue are not part of a position: they belong to the whole request and are
 * collected once by the request form (/checkout).
 */
export interface CartItem {
  /** Stable id of the position (random, created once). Editing a position never changes it. */
  id: string
  /**
   * Identity of the configured thing. Adding an item whose key is already in the selection updates
   * (or, for single-position services, replaces) that position instead of creating a duplicate.
   * - booth / photography: the service slug — one position per service;
   * - photo zones: `photozones:ready:<conceptId>` / `photozones:custom`;
   * - photobooks: one per collection preset, individual configuration, graduation group or legacy project.
   */
  key: string
  service: ServiceSlug
  /** Main line, e.g. «Фотозоны — «Шалфейная арка»». */
  title: string
  /** Kind of the position, e.g. «Готовая фотозона» / «Индивидуальный проект». */
  subtitle?: string
  /** Human-readable chosen options. */
  details: string[]
  /** Short state shown as a badge, e.g. «Макет не завершён». */
  status?: string
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
   * Shapes live in lib/selection.ts.
   */
  config: Record<string, unknown>
  /** Page to go back to for changes. */
  href?: string
  /** ms timestamp of the last change of this position. */
  updatedAt: number
}

/** What a builder produces; `id` and `updatedAt` are assigned by the selection. */
export type CartItemInput = Omit<CartItem, 'id' | 'updatedAt'>

/**
 * - `needs-replace`: a single-position service (booth, photography) already has a different
 *   configuration — nothing was changed; ask the visitor, then call `add(item, { replace: true })`.
 */
export type CartAddResult = 'added' | 'updated' | 'unchanged' | 'needs-replace'
