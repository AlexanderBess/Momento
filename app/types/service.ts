export type ServiceSlug = 'booth' | 'photography' | 'photozones' | 'photobooks'

/** A local image (stored under /public/images). `null` src renders a marked placeholder. */
export interface ImageAsset {
  src: string | null
  alt: string
  /** Intrinsic width / height, used to reserve space and avoid layout shift. */
  width: number
  height: number
}

export interface Service {
  slug: ServiceSlug
  title: string
  /** One-line card caption. */
  summary: string
  href: string
  image: ImageAsset
  /** Priority business direction gets a highlighted treatment. */
  featured?: boolean
}

/**
 * Visual theme of a page: picks the palette (tokens.css, [data-service]) and the page transition
 * (transitions.css). Set per page with `definePageMeta({ service: '…' })`; pages without it are neutral.
 */
export type ServiceTheme = 'photozones' | 'photography' | 'photobooks' | 'photobooth'

declare module '#app' {
  interface PageMeta {
    service?: ServiceTheme
  }
}

/** Page transition preset: the destination page's theme, or `neutral` for every other page. */
export type TransitionPreset = ServiceTheme | 'neutral'
