import type { FormatId, PhotobookFormat } from '~/types/photobook'

/**
 * Book formats and page counts.
 *
 * ⚠️ Preliminary values — the final list must match the print house's production range.
 * To add a format: add an entry here (and its id to `FormatId` in types/photobook.ts) and a price in pricing.ts.
 * `pageCounts` / `coverTypes` restrict a format; the configurator then hides unavailable options
 * and moves the current choice to the nearest valid one.
 */
export const photobookFormats: PhotobookFormat[] = [
  { id: 'square', label: 'Квадратный', widthCm: 30, heightCm: 30 },
  { id: 'landscape', label: 'Альбомный', widthCm: 30, heightCm: 20 },
  { id: 'portrait', label: 'Портретный', widthCm: 20, heightCm: 30 },
]

/** Inner pages, cover not included. Every value must be even (one spread = two pages). */
export const pageCountOptions = [20, 30, 40, 50, 60]

export const PAGES_PER_SPREAD = 2

export function findFormat(id: FormatId): PhotobookFormat {
  return photobookFormats.find((format) => format.id === id) ?? photobookFormats[0]!
}

export function pageCountsFor(format: FormatId): number[] {
  return findFormat(format).pageCounts ?? pageCountOptions
}

export function spreadCountFor(pageCount: number): number {
  return Math.max(1, Math.round(pageCount / PAGES_PER_SPREAD))
}

/**
 * Approximate block thickness in millimetres, used only for the visual spine.
 * Boards ≈ 2 × 3 mm, each inner page ≈ 0.35 mm (demo value; layflat pages are thicker than regular paper).
 */
export function bookThicknessMm(pageCount: number): number {
  return 6 + pageCount * 0.35
}

/** Russian plural helper for page / spread counts. */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}
