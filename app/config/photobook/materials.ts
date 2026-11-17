import type { ExtraOption, PaperType, PaperTypeId, Swatch } from '~/types/photobook'

/**
 * Inner paper, endpapers and extra finishing options.
 *
 * ⚠️ Preliminary list — adapt to the print house's real paper range. Descriptions describe only
 * the look of the surface; no durability or archival claims until the manufacturer confirms them.
 */

export const paperTypes: PaperType[] = [
  {
    id: 'matte',
    label: 'Матовая',
    description: 'Ровная поверхность без бликов, спокойная передача цвета.',
    surface: 'matte',
    tone: '#fbf9f5',
  },
  {
    id: 'glossy',
    label: 'Глянцевая',
    description: 'Блестящая поверхность, насыщенные и контрастные цвета.',
    surface: 'gloss',
    tone: '#ffffff',
  },
  {
    id: 'textured',
    label: 'Фактурная',
    description: 'Бумага с ощутимой фактурой, как у художественной печати.',
    surface: 'texture',
    tone: '#f6f1e7',
  },
]

export function findPaperType(id: PaperTypeId): PaperType {
  return paperTypes.find((paper) => paper.id === id) ?? paperTypes[0]!
}

export const endpaperColors: Swatch[] = [
  { id: 'milk', label: 'Молочный', hex: '#f1ece2', ink: 'dark' },
  { id: 'sand', label: 'Песочный', hex: '#dccbb0', ink: 'dark' },
  { id: 'violet', label: 'Пыльно-фиолетовый', hex: '#a297b9', ink: 'dark' },
  { id: 'graphite', label: 'Графитовый', hex: '#3d3a37', ink: 'light' },
]

export function findEndpaper(id: string): Swatch {
  return endpaperColors.find((color) => color.id === id) ?? endpaperColors[0]!
}

export const extraOptions: ExtraOption[] = [
  {
    id: 'embossing',
    label: 'Тиснёная рамка',
    description: 'Блинтовая рамка по контуру лицевой стороны.',
  },
  {
    id: 'spineText',
    label: 'Надпись на корешке',
    description: 'Название книги повторяется на корешке.',
  },
]
