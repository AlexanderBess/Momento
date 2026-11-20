import type { LeadRequest, LeadResponse } from '#shared/lead'

/**
 * Lead delivery — the single client-side integration point for requests.
 *
 * Posts to the site's own endpoint (/api/leads), which forwards to Telegram; secrets never reach
 * the browser. Only a confirmed `{ ok: true }` from the server counts as delivered. A timeout or a
 * dropped connection is `network`: the request may or may not have arrived, so the caller retries
 * with the same idempotency key and the server will not deliver it twice.
 */
export async function submitLead(lead: LeadRequest): Promise<LeadResponse> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(30000),
    })
    const data = (await response.json().catch(() => null)) as LeadResponse | null
    if (data && typeof data.ok === 'boolean') {
      if (data.ok && response.ok && typeof data.requestNumber === 'string') return data
      if (!data.ok) return data
    }
    return { ok: false, reason: response.status === 404 ? 'not-configured' : 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
