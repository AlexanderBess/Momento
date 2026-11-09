import type { ImageAsset } from '~/types/service'

export type PortfolioCategory = 'events' | 'photozones' | 'ai' | 'photobooks'

export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  events: 'События',
  photozones: 'Фотозоны',
  ai: 'AI-фото',
  photobooks: 'Фотокниги',
}

export interface PortfolioItem {
  id: string
  category: PortfolioCategory
  image: ImageAsset
}

/**
 * Home page preview of the portfolio.
 * Until real work exists every item is a labelled placeholder (`src: null`) —
 * no invented cases or stock photos presented as the company's work.
 */
export const portfolioPreview: PortfolioItem[] = [
  {
    id: 'event-1',
    category: 'events',
    image: { src: null, alt: 'Живой момент праздника', width: 1600, height: 1200 },
  },
  {
    id: 'photozone-1',
    category: 'photozones',
    image: { src: null, alt: 'Оформленная фотозона', width: 1200, height: 1200 },
  },
  {
    id: 'ai-1',
    category: 'ai',
    image: { src: null, alt: 'Пример AI-образа из фотобудки', width: 1200, height: 1600 },
  },
  {
    id: 'photobook-1',
    category: 'photobooks',
    image: { src: null, alt: 'Разворот фотокниги', width: 1200, height: 1200 },
  },
]
