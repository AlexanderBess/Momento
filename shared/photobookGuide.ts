import { coverTypes, findCoverColor, findCoverType } from '../app/config/photobook/covers'
import { findFormat, pageCountsFor, photobookFormats } from '../app/config/photobook/formats'
import type { CoverTypeId, FormatId } from '../app/types/photobook'
import {
  isDeliveryDate,
  PERSONAL_COLLECTION_ORDER,
  photobookDeliveryDetail,
  photobookSpecificationDetails,
} from './photobookCollection'

export const INDIVIDUAL_PHOTOBOOK_ORDER = 'personal-individual'

export interface PhotobookGuideOptions {
  format: FormatId
  pageCount: number
  coverType: CoverTypeId
  coverColor: string
}

export interface PhotobookGuideOrder {
  orderType: typeof INDIVIDUAL_PHOTOBOOK_ORDER
  specification: PhotobookGuideOptions
  desiredDeliveryDate?: string
}

export function isPersonalPhotobookOrder(orderType: unknown): boolean {
  return orderType === PERSONAL_COLLECTION_ORDER || orderType === INDIVIDUAL_PHOTOBOOK_ORDER
}

export function guideCoversFor(format: FormatId) {
  const allowed = findFormat(format).coverTypes
  return allowed ? coverTypes.filter((cover) => allowed.includes(cover.id)) : coverTypes
}

/** Select compatible defaults only when a previous choice is unavailable. */
export function normalizeGuideOptions(options: PhotobookGuideOptions): PhotobookGuideOptions {
  const pages = pageCountsFor(options.format)
  const covers = guideCoversFor(options.format)
  const coverType = covers.find(({ id }) => id === options.coverType)?.id ?? covers[0]!.id
  return {
    ...options,
    pageCount: pages.includes(options.pageCount) ? options.pageCount : pages[0]!,
    coverType,
    coverColor: findCoverColor(coverType, options.coverColor).id,
  }
}

export function defaultGuideOptions(): PhotobookGuideOptions {
  const format = photobookFormats[0]!.id
  const cover = guideCoversFor(format)[0]!
  return { format, pageCount: pageCountsFor(format)[0]!, coverType: cover.id, coverColor: cover.colors[0]!.id }
}

export function photobookGuideOrder(specification: PhotobookGuideOptions, desiredDeliveryDate?: string): PhotobookGuideOrder {
  const { format, pageCount, coverType, coverColor } = specification
  return {
    orderType: INDIVIDUAL_PHOTOBOOK_ORDER,
    specification: { format, pageCount, coverType, coverColor },
    ...(desiredDeliveryDate ? { desiredDeliveryDate } : {}),
  }
}

/** Reject invalid combinations at the request boundary instead of silently changing them. */
export function readPhotobookGuideOrder(config: Record<string, unknown>): PhotobookGuideOrder | null {
  if (config.orderType !== INDIVIDUAL_PHOTOBOOK_ORDER || !config.specification || typeof config.specification !== 'object') return null
  const { format, pageCount, coverType, coverColor } = config.specification as Record<string, unknown>
  const selectedFormat = photobookFormats.find(({ id }) => id === format)
  if (!selectedFormat || typeof pageCount !== 'number' || !pageCountsFor(selectedFormat.id).includes(pageCount)) return null
  const cover = guideCoversFor(selectedFormat.id).find(({ id }) => id === coverType)
  const color = cover?.colors.find(({ id }) => id === coverColor)
  if (!cover || !color) return null
  const date = config.desiredDeliveryDate
  if (date !== undefined && !isDeliveryDate(date)) return null
  return photobookGuideOrder({ format: selectedFormat.id, pageCount, coverType: cover.id, coverColor: color.id }, date)
}

export function photobookGuideDetails(order: PhotobookGuideOrder): string[] {
  const { coverType, coverColor } = order.specification
  const label = findCoverType(coverType).usesPhoto ? 'Цвет корешка и полосы с названием' : 'Цвет обложки'
  const details = [
    ...photobookSpecificationDetails(order.specification),
    `${label}: ${findCoverColor(coverType, coverColor).label.toLowerCase()}`,
  ]
  if (order.desiredDeliveryDate) details.push(photobookDeliveryDetail(order.desiredDeliveryDate))
  return details
}
