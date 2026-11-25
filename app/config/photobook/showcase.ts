import type { PresetId } from '~/types/photobook'
import type { ImageAsset } from '~/types/service'
import type { PhotobookGuideOptions } from '#shared/photobookGuide'
import { findCoverColor, findCoverType } from './covers'
import { heroClosedBook, heroOpenBook } from './hero'

export const photobookCollectionImages: Partial<Record<PresetId, ImageAsset>> = {
  weddingStory: heroOpenBook,
}

const fabricSamples: Partial<Record<string, ImageAsset>> = heroClosedBook

export function guideCoverSample({ coverType, coverColor }: PhotobookGuideOptions): ImageAsset {
  const photo = coverType === 'fabric' ? fabricSamples[coverColor] : undefined
  return photo ?? {
    src: null,
    alt: `Обложка: ${findCoverType(coverType).label.toLowerCase()}, ${findCoverColor(coverType, coverColor).label.toLowerCase()}`,
    width: 1600,
    height: 1200,
  }
}

export const graduationAlbumSample: ImageAsset = {
  src: '/images/about/photobook-school.webp',
  alt: 'Обложка школьного выпускного альбома с портретом',
  width: 2000,
  height: 2000,
}
