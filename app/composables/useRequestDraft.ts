import type { ContactChannel, LeadEventType, LeadFailureReason } from '#shared/lead'
import { CART_TTL_MS } from '~/composables/useCart'
import { createId } from '~/lib/ids'

/**
 * The request form being filled in (/checkout): event details + contacts, kept in localStorage so
 * a failed sending, a reload or a detour to a service page never loses what was typed.
 * Consent is never stored — it is given again for each sending.
 *
 * Also keeps the idempotency key of the current request, so a retry after an unclear failure
 * (timeout, dropped connection) can never deliver the same request twice.
 * Cleared after a confirmed delivery; dropped after 30 days without changes, like the selection.
 */

export interface RequestDraft {
  eventOpen: boolean
  event: {
    type: LeadEventType | null
    date: string
    time: string
    duration: string
    venue: string
    wishes: string
  }
  contact: {
    name: string
    phone: string
    channel: ContactChannel | null
    telegram: string
    email: string
    comment: string
  }
}

export interface SendingState {
  key: string
  /** Fingerprint of the request content the key was issued for. */
  content: string
  lastFailure: LeadFailureReason | null
}

const STORAGE_KEY = 'momento:request-draft:v1'

/** Short fingerprint of the request content (only compared, never sent). */
function hash(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return `${text.length}:${(h >>> 0).toString(36)}`
}

export const emptyDraft = (): RequestDraft => ({
  eventOpen: false,
  event: { type: null, date: '', time: '', duration: '', venue: '', wishes: '' },
  contact: { name: '', phone: '', channel: null, telegram: '', email: '', comment: '' },
})

interface Stored {
  savedAt: number
  draft: RequestDraft
  sending: SendingState | null
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Stored
    if (!data?.draft || typeof data.savedAt !== 'number' || Date.now() - data.savedAt >= CART_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    const base = emptyDraft()
    return {
      savedAt: data.savedAt,
      draft: {
        eventOpen: data.draft.eventOpen === true,
        event: { ...base.event, ...data.draft.event },
        contact: { ...base.contact, ...data.draft.contact },
      },
      sending: data.sending ?? null,
    }
  } catch {
    return null
  }
}

function write(stored: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage unavailable: the form still works for this visit.
  }
}

export function useRequestDraft() {
  const draft = useState<RequestDraft>('request-draft', emptyDraft)
  const sending = useState<SendingState | null>('request-sending', () => null)
  const loaded = useState('request-draft-loaded', () => false)

  function load() {
    const stored = read()
    if (stored) {
      draft.value = stored.draft
      sending.value = stored.sending
    }
    loaded.value = true
  }

  function save() {
    if (!loaded.value) return
    const empty = { ...emptyDraft(), eventOpen: draft.value.eventOpen }
    if (!sending.value && JSON.stringify(draft.value) === JSON.stringify(empty)) {
      // Nothing typed (or just sent): keep no stored data at all.
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
      return
    }
    write({ savedAt: Date.now(), draft: draft.value, sending: sending.value })
  }

  /**
   * Key for sending `content`. A retry of the same content reuses the key; so does any retry after
   * an unclear failure (the server may already have the request). After a definite refusal a new
   * content gets a new key.
   */
  function keyFor(payload: string): string {
    const content = hash(payload)
    const current = sending.value
    if (current && (current.content === content || current.lastFailure === 'network')) {
      sending.value = { ...current, content }
    } else {
      sending.value = { key: createId('req').replace('_', '-'), content, lastFailure: null }
    }
    save()
    return sending.value.key
  }

  function markFailure(reason: LeadFailureReason) {
    if (sending.value) sending.value = { ...sending.value, lastFailure: reason }
    save()
  }

  /** After a confirmed delivery. */
  function clear() {
    draft.value = emptyDraft()
    sending.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return { draft, loaded, load, save, keyFor, markFailure, clear }
}
