import type { CoverType, CoverTypeId, Swatch, TitleColor, TitlePosition } from '~/types/photobook'

/**
 * Cover materials, their colours and title finishes.
 *
 * ⚠️ Demo range. Only colours the print house can actually produce may stay in this list —
 * confirm every swatch (and its real sample photo) with the manufacturer before launch.
 */

const foilGold: TitleColor = { id: 'gold', label: 'Золото', finish: 'foil', hex: '#c9a45c', hexTo: '#8f6b2c' }
const foilSilver: TitleColor = { id: 'silver', label: 'Серебро', finish: 'foil', hex: '#d9d9d6', hexTo: '#8d8f93' }
const blind: TitleColor = { id: 'blind', label: 'Блинтовое тиснение', finish: 'deboss', hex: 'transparent' }
const inkWhite: TitleColor = { id: 'white', label: 'Белый', finish: 'ink', hex: '#fbfaf7' }
const inkGraphite: TitleColor = { id: 'graphite', label: 'Графит', finish: 'ink', hex: '#2c2a27' }

const milk: Swatch = { id: 'milk', label: 'Молочный', hex: '#ece5d8', ink: 'dark' }
const sand: Swatch = { id: 'sand', label: 'Песочный', hex: '#d4c3a6', ink: 'dark' }
const beige: Swatch = { id: 'beige', label: 'Бежевый', hex: '#bfa98a', ink: 'dark' }
const grey: Swatch = { id: 'grey', label: 'Серый', hex: '#9b968f', ink: 'dark' }
const graphite: Swatch = { id: 'graphite', label: 'Графитовый', hex: '#3b3835', ink: 'light' }
const violet: Swatch = { id: 'violet', label: 'Пыльно-фиолетовый', hex: '#857aa0', ink: 'light' }

export const coverTypes: CoverType[] = [
  {
    id: 'fabric',
    label: 'Тканевая',
    description: 'Переплётная ткань с мягкой фактурой.',
    surface: 'linen',
    colors: [milk, sand, beige, grey, graphite, violet],
    titleColors: [foilGold, foilSilver, blind, inkWhite, inkGraphite],
    supportsSpineColor: true,
    supportsEmbossing: true,
    usesPhoto: false,
  },
  {
    id: 'leatherette',
    label: 'Кожзам',
    description: 'Переплётный материал с тиснёной зернистой фактурой.',
    surface: 'grain',
    colors: [
      { ...milk, hex: '#e6ded0' },
      { ...beige, hex: '#b59c7c' },
      { ...grey, hex: '#8a8580' },
      { ...graphite, hex: '#2f2c2a' },
    ],
    titleColors: [foilGold, foilSilver, blind],
    supportsSpineColor: true,
    supportsEmbossing: true,
    usesPhoto: false,
  },
  {
    id: 'photo',
    label: 'С фотопечатью',
    description: 'Фотография на всю лицевую сторону обложки.',
    surface: 'print',
    // For a printed cover the colour is the spine and the title band.
    colors: [milk, graphite],
    titleColors: [inkWhite, inkGraphite],
    supportsSpineColor: false,
    supportsEmbossing: false,
    usesPhoto: true,
  },
]

export const titlePositions: { id: TitlePosition; label: string }[] = [
  { id: 'top', label: 'Сверху' },
  { id: 'center', label: 'По центру' },
  { id: 'bottom', label: 'Снизу' },
]

export const COVER_TITLE_MAX_LENGTH = 40

export function findCoverType(id: CoverTypeId): CoverType {
  return coverTypes.find((type) => type.id === id) ?? coverTypes[0]!
}

export function findCoverColor(type: CoverTypeId, colorId: string): Swatch {
  const { colors } = findCoverType(type)
  return colors.find((color) => color.id === colorId) ?? colors[0]!
}

export function findTitleColor(type: CoverTypeId, colorId: string): TitleColor {
  const { titleColors } = findCoverType(type)
  return titleColors.find((color) => color.id === colorId) ?? titleColors[0]!
}
