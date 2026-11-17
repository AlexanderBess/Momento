/**
 * Lead delivery — the single integration point for order requests from any page.
 *
 * The site has no backend of its own yet. Requests are POSTed as JSON to the endpoint configured in
 * `runtimeConfig.public.leadsEndpoint` (env `NUXT_PUBLIC_LEADS_ENDPOINT`): a CRM webhook, a form
 * service or a future /api route. Without an endpoint nothing is sent and the caller gets
 * `not-configured` — the UI must never pretend a request was delivered.
 */

export interface LeadContact {
  name: string
  phone: string
  email: string | null
  preferredChannel: string
  comment: string | null
}

export interface Lead<TPayload = unknown> {
  service: string
  contact: LeadContact
  /** Structured, service-specific details (e.g. the photobook configuration). */
  payload: TPayload
  consent: { personalData: true; at: string }
  source: { page: string }
}

export type LeadResult = { ok: true } | { ok: false; reason: 'not-configured' | 'network' | 'rejected' }

export async function submitLead(lead: Lead, endpoint: string | undefined): Promise<LeadResult> {
  if (!endpoint) return { ok: false, reason: 'not-configured' }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(15000),
    })
    return response.ok ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    return { ok: false, reason: 'network' }
  }
}
