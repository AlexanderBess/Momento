import { findCoverType } from '~/config/photobook/covers'
import { findFormat, pageCountsFor, spreadCountFor } from '~/config/photobook/formats'
import { extraOptions, findPaperType } from '~/config/photobook/materials'
import { photobookPricing, type PhotobookPricing } from '~/config/photobook/pricing'
import { effectiveExtras } from '~/lib/photobook'
import type { PhotobookConfig } from '~/types/photobook'

export interface PriceLine {
  label: string
  amount: number
}

export type PriceResult =
  | { mode: 'on-request' }
  | { mode: 'estimate'; isDemo: boolean; lines: PriceLine[]; unit: number; total: number; quantity: number }

/**
 * P = P_base + P_pages + P_cover + P_paper + P_extras;  total = P × quantity.
 * Pure function: swap it for an API call later — components only consume `PriceResult`.
 */
export function calculatePrice(config: PhotobookConfig, pricing: PhotobookPricing = photobookPricing): PriceResult {
  if (pricing.mode === 'on-request') return { mode: 'on-request' }

  const format = findFormat(config.format)
  const spreads = spreadCountFor(config.pageCount)
  const minSpreads = spreadCountFor(Math.min(...pageCountsFor(config.format)))
  const extraSpreads = Math.max(0, spreads - minSpreads)
  const cover = findCoverType(config.coverType)
  const paper = findPaperType(config.paperType)

  const lines: PriceLine[] = [
    { label: `Формат ${format.widthCm}×${format.heightCm}`, amount: pricing.base[config.format] },
    { label: `Страницы: +${extraSpreads * 2}`, amount: extraSpreads * pricing.perSpread[config.format] },
    { label: `Обложка: ${cover.label.toLowerCase()}`, amount: pricing.cover[config.coverType] },
    { label: `Бумага: ${paper.label.toLowerCase()}`, amount: spreads * pricing.paperPerSpread[config.paperType] },
  ]

  if (config.spineColor !== 'match') lines.push({ label: 'Контрастный корешок', amount: pricing.spineColor })
  const extras = effectiveExtras(config)
  for (const extra of extraOptions) {
    if (extras[extra.id]) lines.push({ label: extra.label, amount: pricing.extras[extra.id] })
  }

  const visible = lines.filter((line) => line.amount > 0)
  const unit = visible.reduce((sum, line) => sum + line.amount, 0)
  return { mode: 'estimate', isDemo: pricing.isDemo, lines: visible, unit, total: unit * config.quantity, quantity: config.quantity }
}

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })

export function formatRub(amount: number): string {
  return rub.format(amount)
}

export function usePhotobookPrice() {
  const { config } = usePhotobookStudio()
  return computed(() => calculatePrice(config.value))
}
