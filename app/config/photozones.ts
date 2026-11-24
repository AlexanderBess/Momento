import type { ImageAsset } from '~/types/service'

/**
 * Content of the photo zones page (/services/photozones) — the single place for catalogue data,
 * images, options and prices. Components only read from here.
 *
 * Rules for this file:
 * - MOMENTO has no photos of its own photo zones yet. Every concept is a design CONCEPT, labelled
 *   as such on the page; images are `src: null` and the page draws a schematic sketch instead
 *   (PhotozoneVisual). To connect a real photo, put the file into public/images/photozones/ and set
 *   `src` + real `width`/`height` — no component changes needed. Never put stock or AI pictures here
 *   as if they were finished MOMENTO projects.
 * - Prices below are DEMO values (`photozonePricing.isDemo`), shown with a «демо-цена» label.
 *   `null` means «Стоимость обсуждается». Replace with confirmed prices and set `isDemo: false`.
 * - Concept `id`s and option `id`s go into the order (cart) — do not rename them once live.
 */

/* ---------- Pricing flags ---------- */

export const photozonePricing = {
  /** All figures in this file are test values until the owner confirms real prices. */
  isDemo: true,
}

/* ---------- Sketches (placeholder illustrations) ---------- */

/** Schematic drawing used while a concept has no photo. Purely illustrative. */
export interface PhotozoneSketch {
  shape: 'arch' | 'circle' | 'panels' | 'cloud' | 'frame'
  /** Backdrop wall, main structure, accent (florals / balloons). */
  palette: [string, string, string]
  /** Where floral clusters sit. */
  florals?: 'base' | 'corner' | 'both' | 'none'
  /** Neon-like script line across the structure. */
  neon?: boolean
}

/** Image slot: a real photo when `image.src` is set, otherwise the sketch. */
export interface PhotozoneVisualAsset {
  image: ImageAsset
  sketch: PhotozoneSketch
}

const visual = (alt: string, sketch: PhotozoneSketch, width = 1600, height = 2000): PhotozoneVisualAsset => ({
  image: { src: null, alt, width, height },
  sketch,
})

/* ---------- Hero & format blocks ---------- */

export const photozonesHero = {
  visual: visual('Фотозона с аркой и живыми цветами на светлой площадке', {
    shape: 'arch',
    palette: ['#e8e9df', '#f7f6f1', '#a9b096'],
    florals: 'both',
  }),
  /** Small caption next to the visual. Keep it true to the actual image. */
  caption: 'Концепция оформления',
}

export const photozoneFormats = {
  ready: visual(
    'Готовая фотозона из коллекции MOMENTO',
    { shape: 'panels', palette: ['#f1efe8', '#e8e9df', '#a9b096'], florals: 'base' },
    1600,
    1200,
  ),
  custom: visual('Индивидуальное оформление фотозоны под мероприятие', {
    shape: 'frame',
    palette: ['#dfe2d3', '#f7f6f1', '#8f9779'],
    florals: 'corner',
    neon: true,
  }),
}

/* ---------- Catalogue ---------- */

export type PhotozoneCategory = 'wedding' | 'birthday' | 'kids' | 'other'

export const photozoneCategoryLabels: Record<PhotozoneCategory, string> = {
  wedding: 'Свадьбы',
  birthday: 'Дни рождения',
  kids: 'Детские праздники',
  other: 'Другие мероприятия',
}

/** Singular labels for a card / details («Свадьба»). */
export const photozoneCategoryNames: Record<PhotozoneCategory, string> = {
  wedding: 'Свадьба',
  birthday: 'День рождения',
  kids: 'Детский праздник',
  other: 'Другие мероприятия',
}

export interface PhotozoneConcept {
  id: string
  title: string
  /** Main category: shown on the card. */
  category: PhotozoneCategory
  /** All categories the concept is shown under in the filter (includes `category`). */
  categories: PhotozoneCategory[]
  /** One line for the card. */
  summary: string
  /** Paragraph for the details dialog. */
  description: string
  /** Construction size, metres. */
  dimensions: { width: number; height: number; depth?: number }
  /** What the set includes. */
  composition: string[]
  /** Suitable events, free text. */
  suitableFor: string[]
  /** Base rental price, RUB; `null` → «Стоимость обсуждается». */
  basePrice: number | null
  /** First item is the cover. */
  gallery: PhotozoneVisualAsset[]
}

export const photozoneConcepts: PhotozoneConcept[] = [
  {
    id: 'sage-arch',
    title: 'Шалфейная арка',
    category: 'wedding',
    categories: ['wedding', 'other'],
    summary: 'Высокая арка с живой зеленью и мягкими текстилями.',
    description:
      'Классическая свадебная композиция: арка в светлых тонах, пышные цветочные акценты у основания и на верхней дуге, лёгкая драпировка. Спокойная палитра подходит для дневной и вечерней съёмки.',
    dimensions: { width: 2.2, height: 2.4, depth: 0.8 },
    composition: ['Арка из металла с матовым покрытием', 'Флористические композиции (2 шт.)', 'Драпировка из лёгкой ткани', 'Подиум 2,4 × 1 м'],
    suitableFor: ['Свадьба', 'Выездная регистрация', 'Годовщина'],
    basePrice: 18000,
    gallery: [
      visual('Концепция: арка с флористикой — общий вид', { shape: 'arch', palette: ['#eceee4', '#f7f6f1', '#a9b096'], florals: 'both' }),
      visual('Концепция: арка с флористикой — детали цветов', { shape: 'arch', palette: ['#e1e4d6', '#f7f6f1', '#8f9779'], florals: 'corner' }),
      visual('Концепция: арка с флористикой — вечерний свет', { shape: 'arch', palette: ['#d9dccb', '#eef0e6', '#747b62'], florals: 'base' }),
    ],
  },
  {
    id: 'moon-circle',
    title: 'Лунный круг',
    category: 'birthday',
    categories: ['birthday', 'wedding', 'other'],
    summary: 'Круглый фон, сухоцветы и место для именной надписи.',
    description:
      'Минималистичная круглая конструкция с фактурной поверхностью и композицией из сухоцветов. Легко дополняется именной надписью или неоном — подходит для юбилеев, дней рождения и камерных свадеб.',
    dimensions: { width: 2, height: 2.2, depth: 0.6 },
    composition: ['Круглая панель Ø 2 м', 'Композиция из сухоцветов и пампасной травы', 'Две напольные вазы', 'Цилиндрические подиумы (3 шт.)'],
    suitableFor: ['День рождения', 'Юбилей', 'Камерная свадьба'],
    basePrice: 14000,
    gallery: [
      visual('Концепция: круглая фотозона с сухоцветами — общий вид', { shape: 'circle', palette: ['#efeee6', '#e3e5d8', '#b8a98f'], florals: 'base' }),
      visual('Концепция: круглая фотозона с именной надписью', { shape: 'circle', palette: ['#e8e9df', '#f7f6f1', '#a9b096'], florals: 'corner', neon: true }),
    ],
  },
  {
    id: 'soft-cloud',
    title: 'Мягкое облако',
    category: 'kids',
    categories: ['kids', 'birthday'],
    summary: 'Воздушная композиция из шаров в пастельных тонах.',
    description:
      'Светлая фотозона для детского праздника: органичная гирлянда из шаров разных размеров, мягкие формы и пастельная палитра. Цвета подбираются под тему праздника.',
    dimensions: { width: 2.4, height: 2.2 },
    composition: ['Фоновая панель с закруглёнными краями', 'Органичная гирлянда из шаров', 'Мягкие кубы для декора (3 шт.)'],
    suitableFor: ['Детский день рождения', 'Выписка', 'Семейный праздник'],
    basePrice: 12000,
    gallery: [
      visual('Концепция: детская фотозона с шарами — общий вид', { shape: 'cloud', palette: ['#f3f1ea', '#e8e9df', '#d9c9b0'], florals: 'none' }),
      visual('Концепция: детская фотозона с шарами — пастельная палитра', { shape: 'cloud', palette: ['#eceee4', '#f7f6f1', '#c7cdb6'], florals: 'none' }),
    ],
  },
  {
    id: 'gallery-panels',
    title: 'Галерея',
    category: 'other',
    categories: ['other', 'birthday'],
    summary: 'Три арочные панели разной высоты — для событий и брендов.',
    description:
      'Модульная композиция из трёх панелей: выглядит собранно на корпоративах, презентациях и частных вечерах. Панели можно дополнить логотипом, надписью или флористикой.',
    dimensions: { width: 3, height: 2.4, depth: 0.5 },
    composition: ['Арочные панели (3 шт.) разной высоты', 'Флористика у основания', 'Подиум-ступени'],
    suitableFor: ['Корпоратив', 'Презентация', 'Частный вечер', 'Выпускной'],
    basePrice: 16000,
    gallery: [
      visual('Концепция: фотозона из трёх арочных панелей — общий вид', { shape: 'panels', palette: ['#eeeee6', '#e3e5d8', '#a9b096'], florals: 'base' }),
      visual('Концепция: панели с надписью для мероприятия', { shape: 'panels', palette: ['#e8e9df', '#f7f6f1', '#8f9779'], florals: 'none', neon: true }),
    ],
  },
]

export const hasPhotozoneConcepts = photozoneConcepts.length > 0

export function findConcept(id: string): PhotozoneConcept | undefined {
  return photozoneConcepts.find((c) => c.id === id)
}

/* ---------- Add-on options ---------- */

export type PhotozoneOptionId = 'name-sign' | 'extra-florals' | 'neon-sign' | 'extra-decor'

export interface PhotozoneOption {
  id: PhotozoneOptionId
  label: string
  description: string
  /** RUB; `null` → «Стоимость обсуждается». */
  price: number | null
}

export const photozoneOptions: PhotozoneOption[] = [
  { id: 'name-sign', label: 'Именная надпись', description: 'Имена, дата или название события', price: 3000 },
  { id: 'extra-florals', label: 'Дополнительная флористика', description: 'Больше цветов или другая палитра', price: null },
  { id: 'neon-sign', label: 'Неоновая вывеска', description: 'Готовая фраза из коллекции или ваша', price: 5000 },
  { id: 'extra-decor', label: 'Дополнительный декор', description: 'Свечи, вазы, текстиль, подиумы', price: null },
]

export function findOption(id: string): PhotozoneOption | undefined {
  return photozoneOptions.find((o) => o.id === id)
}

/* ---------- Individual projects ---------- */

export const photozoneCustomDirections = [
  {
    id: 'florals',
    title: 'Флористика',
    text: 'Живые и стабилизированные цветы, зелень, сухоцветы — в палитре вашего события.',
    visual: visual('Флористическое оформление фотозоны', { shape: 'arch', palette: ['#e8e9df', '#f7f6f1', '#8f9779'], florals: 'both' }, 1200, 1500),
  },
  {
    id: 'structures',
    title: 'Декоративные конструкции',
    text: 'Арки, панели, подиумы и объёмные формы под размеры площадки.',
    visual: visual('Декоративные конструкции для фотозоны', { shape: 'panels', palette: ['#eceee4', '#dfe2d3', '#a9b096'], florals: 'none' }, 1200, 1500),
  },
  {
    id: 'personal',
    title: 'Персонализация',
    text: 'Имена, даты, неон, фирменные цвета и детали, понятные только вам.',
    visual: visual('Персонализированная фотозона с надписью', { shape: 'circle', palette: ['#e3e5d8', '#f7f6f1', '#a9b096'], florals: 'corner', neon: true }, 1200, 1500),
  },
]

/* ---------- Full service & order steps ---------- */

export const photozoneServiceSteps = [
  { id: 'prepare', title: 'Подготовка', text: 'Согласовываем концепцию и комплектацию.' },
  { id: 'delivery', title: 'Доставка', text: 'Привозим фотозону на площадку.' },
  { id: 'install', title: 'Монтаж', text: 'Устанавливаем и оформляем фотозону.' },
  { id: 'dismantle', title: 'Демонтаж', text: 'После мероприятия разбираем и забираем декорации.' },
] as const

export const photozoneOrderSteps = [
  'Выбираете готовую фотозону или индивидуальный проект.',
  'Мы уточняем детали и рассчитываем стоимость.',
  'Согласовываем условия и подтверждаем бронирование.',
  'Привозим, устанавливаем и забираем декорации после мероприятия.',
]

export const photozonesFinalCta = {
  visual: visual('Фотозона, готовая к началу праздника', { shape: 'arch', palette: ['#dfe2d3', '#f7f6f1', '#747b62'], florals: 'both' }, 1600, 1200),
}
