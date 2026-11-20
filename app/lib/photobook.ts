import { coverTypes, findCoverColor, findCoverType, findTitleColor, titlePositions } from '~/config/photobook/covers'
import { findFormat, pageCountsFor, plural, spreadCountFor } from '~/config/photobook/formats'
import { findLayout } from '~/config/photobook/layouts'
import { findImage, photoLibraries } from '~/config/photobook/library'
import { endpaperColors, extraOptions, findEndpaper, findPaperType } from '~/config/photobook/materials'
import { findPreset } from '~/config/photobook/presets'
import type {
  LayoutId,
  LibraryImage,
  Orientation,
  PhotobookConfig,
  PhotobookPreset,
  PresetId,
  Spread,
} from '~/types/photobook'

/**
 * Pure configuration logic of the photobook studio (no Vue, no DOM) — easy to reason about and test.
 * The composable usePhotobookStudio wraps these functions into reactive actions.
 */

/** Pseudo spread id of the endpaper view (opened cover: pasted endpaper + flyleaf). */
export const ENDPAPER_ID = 'endpaper'

/* ---------- Deterministic image assignment ---------- */

/** Order in which a preset uses its library: the preset's picks first, then the rest of the library. */
function imageQueue(preset: PhotobookPreset): LibraryImage[] {
  const library = photoLibraries[preset.collection].images
  const picked = preset.imageOrder.map(findImage).filter((image): image is LibraryImage => Boolean(image))
  const rest = library.filter((image) => !preset.imageOrder.includes(image.id))
  return [...picked, ...rest]
}

function countUsage(spreads: Spread[], layoutAware = true): Map<string, number> {
  const usage = new Map<string, number>()
  for (const spread of spreads) {
    const visible = layoutAware ? spread.images.slice(0, findLayout(spread.layout).slots.length) : spread.images
    for (const id of visible) usage.set(id, (usage.get(id) ?? 0) + 1)
  }
  return usage
}

/**
 * Picks the least used image, preferring one that matches the slot's orientation and is not yet on
 * the same spread. Ties are broken by queue order — the same input always gives the same book.
 */
function pickImage(
  queue: LibraryImage[],
  usage: Map<string, number>,
  orientation: Orientation,
  onSpread: Set<string>,
): string {
  let best: LibraryImage | undefined
  let bestScore = Infinity
  for (const image of queue) {
    const score =
      (usage.get(image.id) ?? 0) * 10 + (image.orientation === orientation ? 0 : 4) + (onSpread.has(image.id) ? 100 : 0)
    if (score < bestScore) {
      best = image
      bestScore = score
    }
  }
  const id = best!.id
  usage.set(id, (usage.get(id) ?? 0) + 1)
  onSpread.add(id)
  return id
}

function fillSlots(
  images: string[],
  layout: LayoutId,
  queue: LibraryImage[],
  usage: Map<string, number>,
): string[] {
  const slots = findLayout(layout).slots
  const next = [...images]
  const onSpread = new Set(next.slice(0, slots.length))
  for (let i = next.length; i < slots.length; i++) {
    next[i] = pickImage(queue, usage, slots[i]!.orientation, onSpread)
  }
  return next
}

function nextSpreadSeq(spreads: Spread[]): number {
  return spreads.reduce((max, spread) => Math.max(max, Number(spread.id.slice(2)) || 0), 0) + 1
}

/** Generates `count` new spreads that continue the preset's layout rhythm after `existing`. */
function generateSpreads(preset: PhotobookPreset, existing: Spread[], count: number, seqStart: number): Spread[] {
  const queue = imageQueue(preset)
  const usage = countUsage(existing)
  let captionIndex = existing.filter((spread) => spread.options.caption).length
  const created: Spread[] = []

  for (let i = 0; i < count; i++) {
    const position = existing.length + i
    const layout = preset.layouts[position % preset.layouts.length]!
    const hasCaption = Boolean(findLayout(layout).caption)
    created.push({
      id: `s-${seqStart + i}`,
      layout,
      images: fillSlots([], layout, queue, usage),
      options: { caption: hasCaption ? (preset.captions[captionIndex++ % preset.captions.length] ?? '') : '' },
    })
  }
  return created
}

/* ---------- Config lifecycle ---------- */

export function createConfig(presetId: PresetId, previous?: PhotobookConfig): PhotobookConfig {
  const preset = findPreset(presetId)
  const seq = previous ? nextSpreadSeq(previous.spreads) : 1
  const spreads = generateSpreads(preset, [], spreadCountFor(preset.pageCount), seq)

  return normalize({
    format: preset.format,
    pageCount: preset.pageCount,
    coverType: preset.coverType,
    coverColor: preset.coverColor,
    coverTitle: preset.coverTitle,
    coverTitleEnabled: true,
    coverTitleColor: preset.coverTitleColor,
    coverTitlePosition: preset.coverTitlePosition,
    coverImageId: preset.coverImageId,
    paperType: preset.paperType,
    endpaperColor: preset.endpaperColor,
    spineColor: preset.spineColor,
    extras: { ...preset.extras },
    // The number of copies is the visitor's own choice — a new preset does not reset it.
    quantity: previous?.quantity ?? 1,
    selectedCollection: preset.id,
    activeView: previous?.activeView ?? 'cover',
    activeSpreadId: spreads[0]!.id,
    spreads,
  })
}

/** Adds or removes spreads so the book matches its page count. Existing spreads are kept untouched. */
export function syncSpreads(config: PhotobookConfig): PhotobookConfig {
  const target = spreadCountFor(config.pageCount)
  const current = config.spreads.length
  if (target === current) return config

  let spreads: Spread[]
  if (target < current) {
    spreads = config.spreads.slice(0, target)
  } else {
    const preset = findPreset(config.selectedCollection)
    spreads = [
      ...config.spreads,
      ...generateSpreads(preset, config.spreads, target - current, nextSpreadSeq(config.spreads)),
    ]
  }

  const activeExists = config.activeSpreadId === ENDPAPER_ID || spreads.some((s) => s.id === config.activeSpreadId)
  return { ...config, spreads, activeSpreadId: activeExists ? config.activeSpreadId : spreads[spreads.length - 1]!.id }
}

/**
 * Switches a spread's layout. Already assigned images stay in their slots (and extra ones are kept
 * for later); only slots that never had an image get one from the library.
 */
export function withLayout(config: PhotobookConfig, spreadId: string, layout: LayoutId): Spread[] {
  const preset = findPreset(config.selectedCollection)
  const queue = imageQueue(preset)
  const usage = countUsage(config.spreads.filter((spread) => spread.id !== spreadId))
  return config.spreads.map((spread) => {
    if (spread.id !== spreadId) return spread
    const hasCaption = Boolean(findLayout(layout).caption)
    const caption = spread.options.caption || (hasCaption ? (preset.captions[0] ?? '') : '')
    return { ...spread, layout, images: fillSlots(spread.images, layout, queue, usage), options: { caption } }
  })
}

/**
 * Makes every choice valid for the current format and cover type: unavailable options move to the
 * first available one. Runs after each change, so the state can never describe an unorderable book.
 */
export function normalize(config: PhotobookConfig): PhotobookConfig {
  const format = findFormat(config.format)
  const next = { ...config, extras: { ...config.extras } }

  const allowedCovers = format.coverTypes ?? coverTypes.map((type) => type.id)
  if (!allowedCovers.includes(next.coverType)) next.coverType = allowedCovers[0]!

  const pageCounts = pageCountsFor(next.format)
  if (!pageCounts.includes(next.pageCount)) {
    next.pageCount = pageCounts.reduce((best, n) =>
      Math.abs(n - config.pageCount) < Math.abs(best - config.pageCount) ? n : best,
    )
  }

  const cover = findCoverType(next.coverType)
  if (!cover.colors.some((color) => color.id === next.coverColor)) next.coverColor = cover.colors[0]!.id
  if (!cover.titleColors.some((color) => color.id === next.coverTitleColor)) {
    next.coverTitleColor = cover.titleColors[0]!.id
  }
  if (!cover.supportsSpineColor || !cover.colors.some((color) => color.id === next.spineColor)) {
    next.spineColor = 'match'
  }

  if (!endpaperColors.some((color) => color.id === next.endpaperColor)) next.endpaperColor = endpaperColors[0]!.id

  const library = photoLibraries[findPreset(next.selectedCollection).collection]
  if (!library.images.some((image) => image.id === next.coverImageId)) next.coverImageId = library.images[0]!.id

  return syncSpreads(next)
}

/**
 * Extras that actually apply. A switched-on option whose precondition is gone (no title for the
 * spine lettering) keeps its switch state — it comes back with the title — but is not produced or charged.
 */
export function effectiveExtras(
  config: Pick<PhotobookConfig, 'extras' | 'coverTitleEnabled' | 'coverTitle' | 'coverType'>,
): PhotobookConfig['extras'] {
  const hasTitle = config.coverTitleEnabled && config.coverTitle.trim().length > 0
  return {
    embossing: config.extras.embossing && findCoverType(config.coverType).supportsEmbossing,
    spineText: config.extras.spineText && hasTitle,
  }
}

/* ---------- Order payload ---------- */

/** Structured, human-readable snapshot of the configuration attached to an order request. */
export function serializeConfig(config: PhotobookConfig) {
  const format = findFormat(config.format)
  const cover = findCoverType(config.coverType)
  const preset = findPreset(config.selectedCollection)
  return {
    collection: preset.name,
    format: { id: format.id, label: format.label, sizeCm: `${format.widthCm} × ${format.heightCm}` },
    pages: config.pageCount,
    spreads: config.spreads.length,
    cover: {
      type: cover.id,
      color: config.coverColor,
      title: config.coverTitleEnabled ? config.coverTitle : null,
      titleColor: config.coverTitleEnabled ? config.coverTitleColor : null,
      titlePosition: config.coverTitleEnabled ? config.coverTitlePosition : null,
      demoImage: cover.usesPhoto ? config.coverImageId : null,
      spineColor: config.spineColor,
    },
    paper: config.paperType,
    endpaper: config.endpaperColor,
    extras: effectiveExtras(config),
    quantity: config.quantity,
    layouts: config.spreads.map((spread, index) => ({
      spread: index + 1,
      layout: spread.layout,
      caption: findLayout(spread.layout).caption ? spread.options.caption || null : null,
    })),
  }
}

export type SerializedPhotobook = ReturnType<typeof serializeConfig>

/** Human-readable rows of a configuration — the book's summary in the selection and in the request. */
export function describePhotobook(c: PhotobookConfig): { label: string; value: string }[] {
  const format = findFormat(c.format)
  const cover = findCoverType(c.coverType)
  const extras = effectiveExtras(c)
  const spine = c.spineColor === 'match' ? 'в цвет обложки' : findCoverColor(c.coverType, c.spineColor).label.toLowerCase()
  const rows: { label: string; value: string }[] = [
    { label: 'Коллекция', value: findPreset(c.selectedCollection).name },
    { label: 'Формат', value: `${format.label}, ${format.widthCm} × ${format.heightCm} см` },
    {
      label: 'Страницы',
      value: `${c.pageCount} ${plural(c.pageCount, ['страница', 'страницы', 'страниц'])} · ${c.spreads.length} ${plural(c.spreads.length, ['разворот', 'разворота', 'разворотов'])}`,
    },
    { label: 'Обложка', value: cover.label },
    { label: cover.usesPhoto ? 'Цвет корешка' : 'Цвет обложки', value: findCoverColor(c.coverType, c.coverColor).label },
    {
      label: 'Название',
      value:
        c.coverTitleEnabled && c.coverTitle.trim()
          ? `«${c.coverTitle.trim()}» · ${findTitleColor(c.coverType, c.coverTitleColor).label.toLowerCase()} · ${titlePositions.find((p) => p.id === c.coverTitlePosition)?.label.toLowerCase()}`
          : 'без названия',
    },
    { label: 'Бумага', value: findPaperType(c.paperType).label },
    { label: 'Форзац', value: findEndpaper(c.endpaperColor).label },
  ]
  if (cover.supportsSpineColor) rows.push({ label: 'Корешок', value: spine })
  const chosenExtras = extraOptions.filter((e) => extras[e.id]).map((e) => e.label.toLowerCase())
  rows.push({ label: 'Дополнительно', value: chosenExtras.length ? chosenExtras.join(', ') : 'нет' })
  rows.push({ label: 'Экземпляров', value: String(c.quantity) })
  return rows
}

/* ---------- Project content (what is saved and compared) ---------- */

/** View state of the studio (which page is shown) — saved with the project but never a «change». */
export const VIEW_FIELDS = ['activeView', 'activeSpreadId'] as const

export type PhotobookContent = Omit<PhotobookConfig, (typeof VIEW_FIELDS)[number]>

export function contentOf(config: PhotobookConfig): PhotobookContent {
  const { activeView: _v, activeSpreadId: _s, ...content } = config
  return content
}
