/** A local image under /public/images. A null source uses a labeled placeholder. */
export interface ImageAsset {
  src: string | null
  alt: string
  /** Intrinsic width / height, used to reserve space and avoid layout shift. */
  width: number
  height: number
}
