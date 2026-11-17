import type { LayoutId, LayoutSlot, Orientation, SlotRect, SpreadLayout } from '~/types/photobook'

/**
 * Spread layouts — ready-made compositions, not a free-form editor.
 *
 * Slots are rectangles in spread coordinates (0–100 across both pages, 0–100 top to bottom),
 * so the same layout adapts to any format. `onPage` lets a slot be described relative to one page.
 * To add a layout: add an entry (and its id to `LayoutId`), give it slots — nothing else changes.
 */

function onPage(page: 'L' | 'R', x: number, y: number, w: number, h: number): SlotRect {
  return { x: x / 2 + (page === 'R' ? 50 : 0), y, w: w / 2, h }
}

function slot(rect: SlotRect, orientation: Orientation): LayoutSlot {
  return { ...rect, orientation }
}

export const spreadLayouts: SpreadLayout[] = [
  {
    id: 'full',
    label: 'Full Image',
    description: 'Одна фотография на весь разворот',
    slots: [slot({ x: 0, y: 0, w: 100, h: 100 }, 'landscape')],
  },
  {
    id: 'split',
    label: 'Split',
    description: 'Две фотографии рядом',
    slots: [slot(onPage('L', 8, 8, 84, 84), 'portrait'), slot(onPage('R', 8, 8, 84, 84), 'portrait')],
  },
  {
    id: 'editorial',
    label: 'Editorial Grid',
    description: 'Одна крупная и две небольшие',
    slots: [
      slot(onPage('L', 0, 0, 100, 100), 'portrait'),
      slot(onPage('R', 12, 9, 76, 38), 'landscape'),
      slot(onPage('R', 12, 53, 76, 38), 'landscape'),
    ],
  },
  {
    id: 'collage',
    label: 'Collage',
    description: 'Шесть фотографий, живой ритм',
    slots: [
      slot(onPage('L', 6, 6, 88, 54), 'landscape'),
      slot(onPage('L', 6, 64, 41, 30), 'landscape'),
      slot(onPage('L', 53, 64, 41, 30), 'landscape'),
      slot(onPage('R', 6, 6, 41, 88), 'portrait'),
      slot(onPage('R', 53, 6, 41, 42), 'square'),
      slot(onPage('R', 53, 52, 41, 42), 'square'),
    ],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Одна фотография, воздух и подпись',
    slots: [slot(onPage('R', 22, 20, 56, 56), 'square')],
    caption: { ...onPage('L', 16, 62, 64, 24), align: 'start' },
  },
  {
    id: 'asymmetric',
    label: 'Asymmetric',
    description: 'Смещённый акцент через сгиб',
    slots: [
      slot({ x: 0, y: 0, w: 58, h: 100 }, 'landscape'),
      slot(onPage('R', 36, 10, 54, 48), 'square'),
      slot(onPage('R', 36, 64, 30, 26), 'landscape'),
    ],
  },
]

export const CAPTION_MAX_LENGTH = 120

export function findLayout(id: LayoutId): SpreadLayout {
  return spreadLayouts.find((layout) => layout.id === id) ?? spreadLayouts[0]!
}
