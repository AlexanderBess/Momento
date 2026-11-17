import type { CoverTypeId, ExtraId, FormatId, PaperTypeId } from '~/types/photobook'

/**
 * Photobook pricing.
 *
 *   unit price = base(format, smallest page count)
 *              + extra spreads × spread price(format)
 *              + cover surcharge
 *              + paper surcharge × spreads
 *              + extras
 *   total      = unit price × quantity
 *
 * ⚠️ The numbers below are DEMO values for testing the calculator — they are not the print house's
 * prices. Until real prices are agreed, keep `mode: 'on-request'`: the UI then shows
 * «Стоимость обсуждается» and never prints a figure. With `mode: 'estimate'` and `isDemo: true` the
 * UI labels every figure as an approximate demo estimate.
 *
 * To connect a real calculator (e.g. an API), replace `calculatePrice` in
 * composables/usePhotobookPrice.ts — components only read its result.
 */
export interface PhotobookPricing {
  mode: 'estimate' | 'on-request'
  isDemo: boolean
  currency: 'RUB'
  /** Price of the format with the smallest page count. */
  base: Record<FormatId, number>
  /** Each spread above the smallest page count. */
  perSpread: Record<FormatId, number>
  cover: Record<CoverTypeId, number>
  /** Paper surcharge per spread. */
  paperPerSpread: Record<PaperTypeId, number>
  extras: Record<ExtraId, number>
  /** Spine in a contrasting colour. */
  spineColor: number
  maxQuantity: number
}

export const photobookPricing: PhotobookPricing = {
  mode: 'estimate',
  isDemo: true,
  currency: 'RUB',
  base: { square: 4900, landscape: 4500, portrait: 4500 },
  perSpread: { square: 320, landscape: 280, portrait: 280 },
  cover: { fabric: 900, leatherette: 1200, photo: 0 },
  paperPerSpread: { matte: 0, glossy: 0, textured: 60 },
  extras: { embossing: 600, spineText: 400 },
  spineColor: 500,
  maxQuantity: 10,
}
