import type { ImageAsset } from '~/types/service'

/**
 * Product photos for the photobook hero (/services/photobooks).
 *
 * Each object is a separate cut-out image (transparent WebP/PNG) so the books can be positioned,
 * animated and switched independently. Put the files into /public/images/photobooks/hero/ and set
 * `src`, `width`, `height` to the real file values. Generation prompts: docs/IMAGES.md.
 *
 * While a `src` is `null` the hero keeps its rendered book for that object, so the page never shows
 * an empty or broken slot. A photo replaces the rendered book automatically once `src` is set.
 */

/** Large open photobook lying on a table, shot at a slight angle. Cut-out, trimmed to the book. */
export const heroOpenBook: ImageAsset = {
  src: '/images/photobooks/hero/open-book.webp',
  alt: 'Раскрытая фотокнига в песочной тканевой обложке со свадебными фотографиями на развороте',
  width: 1178,
  height: 473,
}

/**
 * Closed linen-bound photobook, one photo per cover colour (same angle, light and crop in every file,
 * so switching colours is a clean cross-fade). Keys match the fabric colour ids in covers.ts.
 * milk / violet / graphite are recoloured from closed-sand.webp by scripts/recolor-cover.cjs
 * (same frame, shading and weave): node scripts/recolor-cover.cjs <sand-cutout.png> <out-dir>
 */
export const heroClosedBook: Record<'milk' | 'sand' | 'violet' | 'graphite', ImageAsset> = {
  milk: {
    src: '/images/photobooks/hero/closed-milk.webp',
    alt: 'Закрытая фотокнига в молочной тканевой обложке',
    width: 481,
    height: 537,
  },
  sand: {
    src: '/images/photobooks/hero/closed-sand.webp',
    alt: 'Закрытая фотокнига в песочной тканевой обложке',
    width: 481,
    height: 537,
  },
  violet: {
    src: '/images/photobooks/hero/closed-violet.webp',
    alt: 'Закрытая фотокнига в пыльно-фиолетовой тканевой обложке',
    width: 481,
    height: 537,
  },
  graphite: {
    src: '/images/photobooks/hero/closed-graphite.webp',
    alt: 'Закрытая фотокнига в графитовой тканевой обложке',
    width: 481,
    height: 537,
  },
}

/** Optional loose prints next to the open book (cut-outs with a white border). Empty `src` → not shown with photos. */
export const heroPrints: ImageAsset[] = [
  { src: null, alt: 'Отпечаток свадебной фотографии', width: 800, height: 1000 },
  { src: null, alt: 'Отпечаток пейзажной фотографии', width: 800, height: 1000 },
]
