import { findCoverType } from '../app/config/photobook/covers'
import { findFormat } from '../app/config/photobook/formats'
import { findPreset, photobookPresets } from '../app/config/photobook/presets'
import { photobookPricing } from '../app/config/photobook/pricing'
import type { CoverTypeId, FormatId, PresetId } from '../app/types/photobook'

export const PERSONAL_COLLECTION_ORDER = 'personal-collection'
export const PHOTOBOOK_QUOTE_LABEL = 'Стоимость рассчитывается индивидуально'

export interface PhotobookCollectionPreferences {
  presetId: PresetId
  desiredDeliveryDate?: string
}

export interface PhotobookCollectionOrder extends PhotobookCollectionPreferences {
  orderType: typeof PERSONAL_COLLECTION_ORDER
  specification: { format: FormatId; pageCount: number; coverType: CoverTypeId }
}

export function photobookCollectionOrder({ presetId, desiredDeliveryDate }: PhotobookCollectionPreferences): PhotobookCollectionOrder {
  const { format, pageCount, coverType } = findPreset(presetId)
  return {
    orderType: PERSONAL_COLLECTION_ORDER,
    presetId,
    specification: { format, pageCount, coverType },
    ...(desiredDeliveryDate ? { desiredDeliveryDate } : {}),
  }
}

export function isDeliveryDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Rebuild the snapshot from the active catalog, including when reading a request from the wire. */
export function readPhotobookCollectionOrder(config: Record<string, unknown>): PhotobookCollectionOrder | null {
  if (config.orderType !== PERSONAL_COLLECTION_ORDER) return null
  const preset = photobookPresets.find(({ id }) => id === config.presetId)
  if (!preset) return null
  const date = config.desiredDeliveryDate
  if (date !== undefined && !isDeliveryDate(date)) return null
  return photobookCollectionOrder({ presetId: preset.id, desiredDeliveryDate: date })
}

export function photobookSpecificationDetails({ format, pageCount, coverType }: PhotobookCollectionOrder['specification']): string[] {
  const { widthCm, heightCm } = findFormat(format)
  return [
    `Размер: ${widthCm} × ${heightCm} см`,
    `Количество страниц: ${pageCount}`,
    `Материал обложки: ${findCoverType(coverType).label.toLowerCase()}`,
  ]
}

export function photobookDeliveryDetail(date: string): string {
  return `Желаемая дата получения: ${date.split('-').reverse().join('.')}`
}

export function photobookCollectionDetails(order: PhotobookCollectionOrder): string[] {
  const details = photobookSpecificationDetails(order.specification)
  if (order.desiredDeliveryDate) details.push(photobookDeliveryDetail(order.desiredDeliveryDate))
  return details
}

/** The studio estimate is independent of the commercial cart and request price. */
export function normalizePhotobookRequestPrice<T extends {
  service: string
  price: number | null
  pricePartial?: boolean
  priceIsDemo?: boolean
}>(item: T): T {
  if (item.service !== 'photobooks') return item
  if (!item.priceIsDemo && !photobookPricing.isDemo && photobookPricing.mode !== 'on-request') return item
  return { ...item, price: null, pricePartial: false, priceIsDemo: false }
}
