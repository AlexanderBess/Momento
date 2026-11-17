/**
 * Photobook studio — shared types.
 *
 * Every option the configurator offers lives in app/config/photobook/*.ts. Components only read
 * those configs, so a new format, colour, material, layout or preset never needs a component change.
 */

/* ---------- Catalogue ids ---------- */

export type FormatId = 'square' | 'landscape' | 'portrait'
export type CoverTypeId = 'fabric' | 'leatherette' | 'photo'
export type PaperTypeId = 'matte' | 'glossy' | 'textured'
export type LayoutId = 'full' | 'split' | 'editorial' | 'collage' | 'minimal' | 'asymmetric'
export type CollectionId = 'wedding' | 'family' | 'travel' | 'little'
export type PresetId = 'weddingStory' | 'familyMoments' | 'travelJournal' | 'littleMoments'
export type TitlePosition = 'top' | 'center' | 'bottom'
export type PreviewView = 'cover' | 'spread' | 'thumbnails'

/** Shape of a photo slot or of a library image — used to put fitting images into slots. */
export type Orientation = 'landscape' | 'portrait' | 'square'

/* ---------- Config entries ---------- */

export interface PhotobookFormat {
  id: FormatId
  label: string
  /** Page (not spread) size in centimetres. Width × height of one closed page. */
  widthCm: number
  heightCm: number
  /** Page counts available for this format. `undefined` → all of `pageCountOptions`. */
  pageCounts?: number[]
  /** Cover types available for this format. `undefined` → all cover types. */
  coverTypes?: CoverTypeId[]
}

export interface Swatch {
  id: string
  label: string
  /** Base colour of the material. */
  hex: string
  /** Text colour that reads well on top of the swatch (UI marks, debossed title fallback). */
  ink: 'light' | 'dark'
}

export type CoverSurface = 'linen' | 'grain' | 'print'

export interface CoverType {
  id: CoverTypeId
  label: string
  description: string
  /** How the material is rendered in the preview. */
  surface: CoverSurface
  /** Material colours (for a photo cover: the colour of the spine and the title band). */
  colors: Swatch[]
  /** Title finishes available on this material. */
  titleColors: TitleColor[]
  /** Spine in a contrasting colour (two-tone binding). */
  supportsSpineColor: boolean
  /** Blind-debossed frame on the front board. */
  supportsEmbossing: boolean
  /** The front board shows a photo from the library. */
  usesPhoto: boolean
}

export interface TitleColor {
  id: string
  label: string
  /** 'foil' renders a metallic gradient, 'deboss' — pressed in tone, 'ink' — flat print. */
  finish: 'foil' | 'deboss' | 'ink'
  hex: string
  /** Second stop of the foil gradient. */
  hexTo?: string
}

export interface PaperType {
  id: PaperTypeId
  label: string
  description: string
  /** Visual treatment of the page surface in the preview. */
  surface: 'matte' | 'gloss' | 'texture'
  /** Paper tone. */
  tone: string
}

export interface ExtraOption {
  id: ExtraId
  label: string
  description: string
}

export type ExtraId = 'embossing' | 'spineText'

/** A rectangle in spread coordinates: 0–100 across the whole spread, 0–100 top to bottom. */
export interface SlotRect {
  x: number
  y: number
  w: number
  h: number
}

export interface LayoutSlot extends SlotRect {
  orientation: Orientation
}

export interface SpreadLayout {
  id: LayoutId
  label: string
  description: string
  slots: LayoutSlot[]
  /** Where the optional caption sits (spread coordinates). Only layouts with this field show a caption. */
  caption?: SlotRect & { align: 'start' | 'center' }
}

/* ---------- Photo library ---------- */

/** A procedural demo illustration — see DemoArtwork.vue. */
export interface DemoArt {
  scene: DemoScene
  /** Five colours: sky / background (2), ground / subject (2), accent. */
  palette: [string, string, string, string, string]
  /** Small deterministic variation of the composition (0–3). */
  variant?: number
}

export type DemoScene =
  | 'horizon'
  | 'hills'
  | 'arch'
  | 'city'
  | 'couple'
  | 'portrait'
  | 'bouquet'
  | 'rings'
  | 'forest'
  | 'family'
  | 'child'
  | 'still'
  | 'window'
  | 'balloons'

export interface LibraryImage {
  /** Stable id — spreads reference images only by this id. */
  id: string
  collection: CollectionId
  category: string
  /** Short visible name in the picker. */
  title: string
  alt: string
  orientation: Orientation
  /**
   * Local photo (under /public/images/photobooks). While it is `null` the procedural
   * illustration `art` is rendered instead — clearly labelled as a demo.
   */
  src: string | null
  art: DemoArt
}

export interface LibraryCategory {
  id: string
  label: string
}

export interface PhotoLibrary {
  collection: CollectionId
  label: string
  categories: LibraryCategory[]
  images: LibraryImage[]
}

/* ---------- Configuration state ---------- */

export interface Spread {
  /** Stable id (`s-1`, `s-2` …), never reused within a session. */
  id: string
  layout: LayoutId
  /**
   * Image ids in slot order. May be longer than the layout's slot count: images of slots that
   * disappear after a layout switch are kept, so switching back restores them.
   */
  images: string[]
  options: {
    caption: string
  }
}

export interface PhotobookExtras {
  embossing: boolean
  spineText: boolean
}

export interface PhotobookConfig {
  format: FormatId
  /** Inner pages only (the cover is not counted). Always even: one spread = two pages. */
  pageCount: number
  coverType: CoverTypeId
  coverColor: string
  coverTitle: string
  coverTitleEnabled: boolean
  coverTitleColor: string
  coverTitlePosition: TitlePosition
  /** Library image on the front board (photo cover only). */
  coverImageId: string
  paperType: PaperTypeId
  endpaperColor: string
  /** `'match'` — spine in the cover colour, otherwise a colour id of the same cover type. */
  spineColor: string
  extras: PhotobookExtras
  quantity: number
  selectedCollection: PresetId
  activeView: PreviewView
  /** A spread id, or `ENDPAPER_ID` for the endpaper view. */
  activeSpreadId: string
  spreads: Spread[]
}

/* ---------- Presets ---------- */

export interface PhotobookPreset {
  id: PresetId
  name: string
  /** Short theme line for the card. */
  theme: string
  description: string
  collection: CollectionId
  format: FormatId
  pageCount: number
  coverType: CoverTypeId
  coverColor: string
  coverTitle: string
  coverTitleColor: string
  coverTitlePosition: TitlePosition
  coverImageId: string
  paperType: PaperTypeId
  endpaperColor: string
  spineColor: string
  extras: PhotobookExtras
  /** Layout rhythm. Spreads cycle through it, so any page count gets a sensible sequence. */
  layouts: LayoutId[]
  /** Images in the order they should appear in the book. The rest of the library follows. */
  imageOrder: string[]
  /** Captions for spreads with a caption-capable layout, used in order. */
  captions: string[]
}
