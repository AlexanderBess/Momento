import type { CartAddResult, CartItem } from '~/types/cart'
import { services } from '~/config/services'

/**
 * The shared MOMENTO request (cart). One list for all services, shown at /checkout and counted on
 * the header bag icon.
 *
 * Stored in localStorage on this device only — nothing is sent anywhere until the visitor submits
 * the request. During SSR and hydration the list is empty; plugins/cart.client.ts loads the saved
 * list right after the app is mounted (no hydration mismatch) and keeps tabs in sync.
 */

export const CART_STORAGE_KEY = 'momento:cart:v1'

const serviceSlugs = new Set<string>(services.map((s) => s.slug))

/** Drops anything that is not a well-formed position (old versions, manual edits). */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.key === 'string' &&
        typeof item.title === 'string' &&
        serviceSlugs.has(item.service) &&
        Array.isArray(item.details) &&
        (item.price === null || typeof item.price === 'number') &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.config === 'object' &&
        item.config !== null,
    )
  } catch {
    return []
  }
}

/** Stable comparison of two configurations (key order does not matter). */
function sameContent(a: CartItem, b: CartItem): boolean {
  const normalize = (item: CartItem) =>
    JSON.stringify([item.title, item.subtitle, item.details, item.price, item.pricePartial, item.quantity, sortKeys(item.config)])
  return normalize(a) === normalize(b)
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    )
  }
  return value
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', () => [])
  /** True once the saved list has been read — before that the count is unknown, not zero. */
  const ready = useState('cart-ready', () => false)

  function persist() {
    if (import.meta.server) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // Private mode / full storage: the cart still works for this visit.
    }
  }

  /** Adds a position, or updates the one with the same key. */
  function add(item: Omit<CartItem, 'updatedAt'>): CartAddResult {
    const next: CartItem = { ...item, updatedAt: Date.now() }
    const index = items.value.findIndex((i) => i.key === item.key)
    if (index === -1) {
      items.value = [...items.value, next]
      persist()
      return 'added'
    }
    if (sameContent(items.value[index]!, next)) return 'unchanged'
    items.value = items.value.map((i, n) => (n === index ? next : i))
    persist()
    return 'updated'
  }

  function remove(key: string) {
    items.value = items.value.filter((i) => i.key !== key)
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  const has = (key: string) => items.value.some((i) => i.key === key)
  const find = (key: string) => items.value.find((i) => i.key === key)

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

  return { items, ready, count, total, add, remove, clear, has, find }
}
