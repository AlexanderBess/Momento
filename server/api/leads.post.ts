import { todayIso, validateLead, type LeadResponse } from '#shared/lead'
import { leadMessageBlocks, preparePhotobookLeadItems, sanitizeLead, splitMessages } from '../utils/leadMessage'

/**
 * POST /api/leads — the only way a request leaves the site:
 *   site → this endpoint → Telegram Bot API → MOMENTO work chat.
 *
 * - The bot token and chat id live only in server env (NUXT_TELEGRAM_BOT_TOKEN,
 *   NUXT_TELEGRAM_CHAT_ID). Without them the endpoint answers 503 `not-configured` — the form says
 *   so honestly and keeps everything for a retry.
 * - Success (200 + server-issued request number) is returned only after Telegram confirmed every
 *   message part.
 * - Idempotency: the client sends a random `idempotencyKey` and reuses it for retries. A key that
 *   was delivered returns the same answer again; a key in flight waits for that delivery. Keys are
 *   kept in this server process's memory for 24 h (a restart or several instances reset it).
 */

const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000
const MAX_BODY_BYTES = 128 * 1024
const KEY_RE = /^[A-Za-z0-9_-]{8,80}$/

type Entry = { at: number; status: number; response: LeadResponse } | { at: number; pending: Promise<{ status: number; response: LeadResponse }> }
const deliveries = new Map<string, Entry>()

function purge(now: number) {
  for (const [key, entry] of deliveries) if (now - entry.at > IDEMPOTENCY_TTL) deliveries.delete(key)
}

function requestNumber(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const suffix = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => alphabet[b % alphabet.length]).join('')
  return `MO-${date}-${suffix}`
}

export default defineEventHandler(async (event) => {
  const reply = (status: number, response: LeadResponse) => {
    setResponseStatus(event, status)
    return response
  }

  const length = Number(getHeader(event, 'content-length') ?? 0)
  if (length > MAX_BODY_BYTES) return reply(413, { ok: false, reason: 'rejected' })

  const lead = sanitizeLead(await readBody(event).catch(() => null))
  if (!lead || !KEY_RE.test(lead.idempotencyKey)) return reply(400, { ok: false, reason: 'rejected' })

  const items = preparePhotobookLeadItems(lead.items)
  if (!items) {
    return reply(422, { ok: false, reason: 'invalid', fields: { items: 'Проверьте параметры фотокниги в подборке.' } })
  }
  lead.items = items

  // Allow «yesterday» for visitors in time zones behind the server.
  const yesterday = todayIso(new Date(Date.now() - 24 * 60 * 60 * 1000))
  const fields = validateLead({ ...lead, consent: true }, yesterday)
  if (Object.keys(fields).length) return reply(422, { ok: false, reason: 'invalid', fields })

  // Honeypot filled → pretend success without delivering (bots get no signal to adapt to).
  if (lead.website) return reply(200, { ok: true, requestNumber: requestNumber() })

  const now = Date.now()
  purge(now)
  const known = deliveries.get(lead.idempotencyKey)
  if (known) {
    const result = 'pending' in known ? await known.pending : known
    if (result.response.ok) return reply(result.status, result.response)
    // A failed attempt with this key may be retried below.
  }

  const { telegramBotToken, telegramChatId, telegramApiBase } = useRuntimeConfig(event)
  if (!telegramBotToken || !telegramChatId) return reply(503, { ok: false, reason: 'not-configured' })

  const deliver = async (): Promise<{ status: number; response: LeadResponse }> => {
    const number = requestNumber()
    const messages = splitMessages(leadMessageBlocks(lead, number))
    try {
      for (const text of messages) {
        const response = await fetch(`${telegramApiBase}/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: telegramChatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
          signal: AbortSignal.timeout(10000),
        })
        const data = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null
        if (!response.ok || !data?.ok) {
          // The token never reaches logs: only Telegram's own description.
          console.error('[leads] Telegram rejected the message:', response.status, data?.description)
          return { status: 502, response: { ok: false, reason: 'delivery-failed' } }
        }
      }
      return { status: 200, response: { ok: true, requestNumber: number } }
    } catch (error) {
      console.error('[leads] Telegram is unreachable:', (error as Error).name)
      return { status: 502, response: { ok: false, reason: 'delivery-failed' } }
    }
  }

  const pending = deliver()
  deliveries.set(lead.idempotencyKey, { at: now, pending })
  const result = await pending
  if (result.response.ok) deliveries.set(lead.idempotencyKey, { at: now, ...result })
  else deliveries.delete(lead.idempotencyKey)
  return reply(result.status, result.response)
})
