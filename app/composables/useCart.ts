import type { CartAddResult, CartItem, CartItemInput } from '~/types/cart'
import type { ServiceSlug } from '~/types/service'
import { services } from '~/config/services'
import { createId, sortKeys } from '~/lib/ids'
import { normalizePhotobookRequestPrice } from '#shared/photobookCollection'
import { isPersonalPhotobookOrder } from '#shared/photobookGuide'

/**
 * The shared MOMENTO selection («Моя подборка»): one list for all services, shown in the header
 * drawer and on /checkout.
 *
 * Stored in localStorage on this device only — nothing is sent anywhere until the visitor submits
 * the request. During SSR and hydration the list is empty; plugins/cart.client.ts loads the saved
 * list right after hydration (no mismatch) and keeps open tabs in sync via `storage` events.
 *
 * Retention: the selection is dropped 30 days after the last *activity* — a successful add, change
 * or removal of a position. `lastActivityAt` is stored next to the list (independent of each
 * position's own `updatedAt`); only reading the list (opening the drawer) never extends it.
 */

export const CART_STORAGE_KEY = 'momento:cart:v2'
const LEGACY_STORAGE_KEY = 'momento:cart:v1'
export const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** Services that hold at most one position: a different configuration replaces it (after a confirm). */
export const SINGLE_POSITION_SERVICES: readonly ServiceSlug[] = ['booth', 'photography']

interface StoredCart {
  version: 2
  lastActivityAt: number
  items: CartItem[]
}

const serviceSlugs = new Set<string>(services.map((s) => s.slug))

function isItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false
  const i = item as Record<string, unknown>
  return (
    typeof i.id === 'string' &&
    typeof i.key === 'string' &&
    typeof i.title === 'string' &&
    serviceSlugs.has(i.service as string) &&
    Array.isArray(i.details) &&
    (i.price === null || typeof i.price === 'number') &&
    Number.isInteger(i.quantity) &&
    (i.quantity as number) > 0 &&
    typeof i.config === 'object' &&
    i.config !== null
  )
}

/** Drops anything that is not a well-formed position (old versions, manual edits). */
function sanitize(list: unknown[]): CartItem[] {
  const seen = new Set<string>()
  return list.filter(isItem).filter((item) => {
    // One position per key and per id, whatever the storage contains.
    const fresh = !seen.has(item.key) && !seen.has(`#${item.id}`)
    seen.add(item.key)
    seen.add(`#${item.id}`)
    return fresh
  }).map(normalizePhotobookRequestPrice)
}

/**
 * Reads the stored selection. Returns `expired: true` when the last activity is 30+ days old —
 * the caller then removes the stored data.
 */
export function readStoredCart(storage: Storage, now = Date.now()): { items: CartItem[]; lastActivityAt: number | null; expired: boolean } {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as Partial<StoredCart>
      const last = typeof data.lastActivityAt === 'number' ? data.lastActivityAt : null
      if (last === null || now - last >= CART_TTL_MS) return { items: [], lastActivityAt: null, expired: true }
      return { items: sanitize(Array.isArray(data.items) ? data.items : []), lastActivityAt: last, expired: false }
    }

    // v1 stored a bare array without ids or activity time: migrate once.
    const legacy = storage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const data: unknown = JSON.parse(legacy)
      const list = Array.isArray(data) ? data : []
      const items = sanitize(list.map((item) => (typeof item === 'object' && item ? { id: createId('pos'), ...item } : item)))
      const last = items.reduce((max, i) => Math.max(max, typeof i.updatedAt === 'number' ? i.updatedAt : 0), 0) || now
      storage.removeItem(LEGACY_STORAGE_KEY)
      if (now - last >= CART_TTL_MS) return { items: [], lastActivityAt: null, expired: true }
      storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 2, lastActivityAt: last, items } satisfies StoredCart))
      return { items, lastActivityAt: last, expired: false }
    }
  } catch {
    // Broken JSON / blocked storage → start empty.
  }
  return { items: [], lastActivityAt: null, expired: false }
}

/** Stable comparison of two configurations (key order does not matter). */
function sameContent(a: CartItemInput, b: CartItemInput): boolean {
  const normalize = (item: CartItemInput) =>
    JSON.stringify([
      item.title,
      item.subtitle,
      item.details,
      item.status,
      item.price,
      item.pricePartial,
      item.quantity,
      sortKeys(item.config),
    ])
  return normalize(a) === normalize(b)
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  /** True once the saved list has been read — before that the count is unknown, not zero. */
  const ready = useState('cart-ready', () => false)

  /** Re-reads the stored list (another tab may have changed it) and drops it when expired. */
  function load() {
    if (import.meta.server) return
    try {
      const stored = readStoredCart(localStorage)
      if (stored.expired) localStorage.removeItem(CART_STORAGE_KEY)
      items.value = stored.items
    } catch {
      // Storage unavailable: keep what this tab has.
    }
    ready.value = true
  }

  /**
   * Every change: read the latest stored list first (so two tabs never overwrite each other's
   * positions), apply the change, save it together with the new activity time.
   */
  function mutate(change: (list: CartItem[]) => CartItem[]) {
    if (import.meta.client) {
      try {
        const stored = readStoredCart(localStorage)
        items.value = stored.items
      } catch {
        // Keep the in-memory list.
      }
    }
    items.value = change(items.value)
    if (import.meta.server) return
    try {
      if (items.value.length) {
        const data: StoredCart = { version: 2, lastActivityAt: Date.now(), items: items.value }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data))
      } else {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    } catch {
      // Private mode / full storage: the selection still works for this visit.
    }
  }

  /**
   * Adds a position, or updates the one with the same key.
   * Single-position services return `needs-replace` for a different configuration unless
   * `replace` is set — the visitor confirms that first.
   */
  function add(input: CartItemInput, { replace = false } = {}): CartAddResult {
    let result: CartAddResult = 'added'
    mutate((list) => {
      const single = SINGLE_POSITION_SERVICES.includes(input.service)
      const index = list.findIndex((i) => (single ? i.service === input.service : i.key === input.key))
      if (index === -1) {
        result = 'added'
        return [...list, { ...input, id: createId('pos'), updatedAt: Date.now() }]
      }
      const current = list[index]!
      // Adding the same book again keeps the delivery preference on the existing position.
      if (sameContent(current, input) || (input.service === 'photobooks' && isPersonalPhotobookOrder(input.config.orderType))) {
        result = 'unchanged'
        return list
      }
      if (single && !replace) {
        result = 'needs-replace'
        return list
      }
      result = 'updated'
      return list.map((i, n) => (n === index ? { ...input, id: current.id, updatedAt: Date.now() } : i))
    })
    return result
  }

  /**
   * Replaces the content of an existing position (editor «Сохранить», Book Studio sync).
   * Keeps the position id. A position removed meanwhile is never re-created here.
   */
  function update(id: string, input: CartItemInput): 'updated' | 'unchanged' | 'missing' | 'key-conflict' {
    let result: ReturnType<typeof update> = 'missing'
    mutate((list) => {
      const index = list.findIndex((i) => i.id === id)
      if (index === -1) return list
      if (list.some((item) => item.id !== id && item.key === input.key)) {
        result = 'key-conflict'
        return list
      }
      if (list[index]!.key === input.key && sameContent(list[index]!, input)) {
        result = 'unchanged'
        return list
      }
      result = 'updated'
      return list.map((i, n) => (n === index ? { ...input, id, updatedAt: Date.now() } : i))
    })
    return result
  }

  function remove(id: string) {
    mutate((list) => list.filter((i) => i.id !== id))
  }

  /** Drops the whole selection (after a successfully delivered request). */
  function clear() {
    mutate(() => [])
  }

  const has = (key: string) => items.value.some((i) => i.key === key)
  const find = (key: string) => items.value.find((i) => i.key === key)
  const findById = (id: string) => items.value.find((i) => i.id === id)

  /** Number of positions (not units) — what the header badge shows. */
  const count = computed(() => items.value.length)

  const total = computed(() => {
    const priced = items.value.filter((i) => i.price !== null)
    return {
      /** Sum of all known prices. */
      known: priced.reduce((sum, i) => sum + i.price! * i.quantity, 0),
      /** Some positions (or parts of them) are priced individually. */
      hasOnRequest: items.value.some((i) => i.price === null || i.pricePartial),
      hasDemo: priced.some((i) => i.priceIsDemo),
      hasKnown: priced.length > 0,
    }
  })

  return { items, ready, count, total, load, add, update, remove, clear, has, find, findById }
}
