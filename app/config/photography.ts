import type { ImageAsset, ServiceSlug } from '~/types/service'

/**
 * Content of the photography page (/services/photography).
 *
 * Rules for this file:
 * - Only real MOMENTO photos go into the images here — never stock or demo pictures presented as our work.
 * - Prices, photo counts and delivery terms stay `null` until the owner confirms them. `null` values
 *   are not rendered as numbers: the UI says that the value is agreed individually.
 * - The photographer's name and texts are placeholders for the owner to replace; no reviews,
 *   awards or credentials are invented.
 * - Images are `src: null` until real photos exist (see docs/IMAGES.md). The page then renders an
 *   explicitly labelled neutral frame. Replacing an image never requires touching components.
 */

/* ---------- Hero ---------- */

export const photographyHero = {
  /** Main hero photo: a vertical portrait or a Love Story frame, ~4:5. */
  image: { src: null, alt: 'Портрет из авторской съёмки MOMENTO', width: 1600, height: 2000 } as ImageAsset,
  /** Small editorial caption under the photo. Keep it true to the actual image. */
  caption: 'Portrait session',
}

/* ---------- Photography formats ---------- */

/** Every format is also a `direction` of the shared order contract (config/order.ts). */
export type PhotographyFormatId = 'portraits' | 'love-stories' | 'family' | 'events' | 'business'

/** Group A — the two main directions, each with a large photo. */
export interface PhotographyMainFormat {
  id: Extract<PhotographyFormatId, 'portraits' | 'love-stories'>
  title: string
  /** Short Russian subtitle under the title. */
  label: string
  description: string
  /** Large photo. `src: null` → neutral labelled frame. */
  image: ImageAsset
  /** Frame proportions — the two directions intentionally differ. */
  ratio: string
}

export const photographyMainFormats: PhotographyMainFormat[] = [
  {
    id: 'portraits',
    title: 'Portraits',
    label: 'Индивидуальные и художественные портреты',
    description: 'Свет, характер и настроение человека в кадре.',
    image: { src: null, alt: 'Художественный портрет в мягком свете', width: 1600, height: 2000 },
    ratio: '4 / 5',
  },
  {
    id: 'love-stories',
    title: 'Love Stories',
    label: 'Романтические съёмки пар',
    description: 'Истории двоих, наполненные эмоциями и настоящими моментами.',
    image: { src: null, alt: 'Пара на прогулке — кадр из Love Story', width: 2000, height: 1500 },
    ratio: '4 / 3',
  },
]

/** Group B — compact text-only list, no photos. */
export interface PhotographyMoreFormat {
  id: Extract<PhotographyFormatId, 'family' | 'events' | 'business'>
  title: string
  label: string
  description: string
}

export const photographyMoreFormats: PhotographyMoreFormat[] = [
  {
    id: 'family',
    title: 'Family Photography',
    label: 'Семейная съёмка',
    description: 'Семейные фотосессии, прогулки и важные моменты вашей семьи.',
  },
  {
    id: 'events',
    title: 'Event Photography',
    label: 'Съёмка мероприятий',
    description: 'Свадьбы, дни рождения, юбилеи и другие мероприятия.',
  },
  {
    id: 'business',
    title: 'Business & Brands',
    label: 'Бизнес и бренды',
    description: 'Деловые портреты, корпоративные мероприятия и визуальный контент для брендов.',
  },
]

/* ---------- Process ---------- */

export const photographySteps = [
  { title: 'Знакомство', text: 'Обсуждаем пожелания, дату, место и формат съёмки.' },
  { title: 'Планирование', text: 'Подбираем подходящий пакет, продолжительность и дополнительные услуги.' },
  { title: 'Съёмка', text: 'Проводим съёмку на выбранной локации или мероприятии.' },
  { title: 'Обработка', text: 'Отбираем и обрабатываем фотографии.' },
  { title: 'Результат', text: 'Передаём готовые фотографии через онлайн-галерею.' },
] as const

/* ---------- Pricing ---------- */

export type PhotographyPackageId = 'basic' | 'standard' | 'extended'

export interface PhotographyPackage {
  id: PhotographyPackageId
  name: string
  title: string
  /** Shooting time, hours ("до N часов"). */
  durationHours: number
  /** Fixed price in RUB. `null` — not confirmed yet, shown as «по запросу». */
  price: number | null
  /** Number of processed photos. `null` — not shown as a number. */
  photos: number | null
  /** Delivery time in days. `null` — «фиксируем при бронировании». */
  deliveryDays: number | null
  /** Confirmed inclusions besides duration / photos / delivery (no numbers here). */
  includes: string[]
  /**
   * Marks the package as recommended («Рекомендуем»). Turn on only if it matches the real
   * commercial strategy.
   */
  recommended?: boolean
}

export const photographyPackages: PhotographyPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    title: 'Короткая история',
    durationHours: 1,
    price: null,
    photos: null,
    deliveryDays: null,
    includes: ['Обработка фотографий', 'Онлайн-галерея'],
  },
  {
    id: 'standard',
    name: 'Standard',
    title: 'Полная история',
    durationHours: 3,
    price: null,
    photos: null,
    deliveryDays: null,
    includes: ['Расширенная серия фотографий', 'Обработка фотографий', 'Онлайн-галерея'],
    recommended: false,
  },
  {
    id: 'extended',
    name: 'Extended',
    title: 'Большая история',
    durationHours: 6,
    price: null,
    photos: null,
    deliveryDays: null,
    includes: ['Расширенная серия фотографий', 'Обработка фотографий', 'Онлайн-галерея'],
  },
]

export type PhotographyExtraId = 'extra-hour' | 'photobook' | 'custom-terms' | 'urgent'

export interface PhotographyExtra {
  id: PhotographyExtraId
  title: string
  description: string
  /** Price in RUB; `null` — «по запросу». */
  price: number | null
  /** Set to `false` to hide an option that is not offered (e.g. urgent processing). */
  available: boolean
}

export const photographyExtras: PhotographyExtra[] = [
  {
    id: 'extra-hour',
    title: 'Дополнительный час',
    description: 'Если событие идёт дольше пакета.',
    price: null,
    available: true,
  },
  {
    id: 'photobook',
    title: 'Фотокнига',
    description: 'Печатная книга из фотографий съёмки.',
    price: null,
    available: true,
  },
  {
    id: 'custom-terms',
    title: 'Индивидуальные условия',
    description: 'Особые пожелания к съёмке, обработке или передаче фото.',
    price: null,
    available: true,
  },
  {
    id: 'urgent',
    title: 'Срочная обработка',
    description: 'Ускоренная подготовка фотографий.',
    price: null,
    available: true,
  },
]

/** Other MOMENTO services that can be added to the same request. */
export const photographyBundleServices: ServiceSlug[] = ['booth', 'photozones']

/* ---------- MOMENTO Extras ---------- */

export interface PhotographyCrossSell {
  service: ServiceSlug
  title: string
  description: string
}

/** Small product image comes from config/services.ts (`image`) — one source for all pages. */
export const photographyCrossSell: PhotographyCrossSell[] = [
  {
    service: 'photobooks',
    title: 'Photo Books',
    description: 'Печатные фотокниги, которые сохранят ваши истории не только в цифровом формате.',
  },
  {
    service: 'photozones',
    title: 'Photo Zones',
    description: 'Индивидуальные фотозоны для свадеб, праздников и мероприятий.',
  },
  {
    service: 'booth',
    title: 'AI Photo Booth',
    description: 'Интерактивная фотобудка, которая подарит гостям необычный опыт и яркие воспоминания.',
  },
]

/* ---------- Photographer ---------- */

export interface Photographer {
  /** `null` — the name line is not rendered. */
  name: string | null
  role: string
  /** A real portrait of the photographer. */
  photo: ImageAsset
  /** Approach to photography — written by the photographer. */
  approach: string
  /** How the work with clients goes. */
  collaboration: string
}

export const photographer: Photographer = {
  name: null,
  role: 'Фотограф MOMENTO',
  photo: { src: null, alt: 'Фотограф MOMENTO', width: 1200, height: 1500 },
  approach:
    'Мне важно, чтобы на фотографиях вы узнавали себя: живые эмоции, естественный свет и детали, из которых складывается атмосфера дня.',
  collaboration:
    'Перед съёмкой мы созваниваемся и обсуждаем идею, место и настроение. Во время съёмки я подскажу, как встать и куда смотреть, — но не буду превращать день в постановку.',
}

/* ---------- FAQ ---------- */

export interface FaqItem {
  question: string
  answer: string
}

export const photographyFaq: FaqItem[] = [
  {
    question: 'Сколько времени занимает обработка фотографий?',
    answer:
      'Срок зависит от пакета и объёма съёмки. Точную дату готовности фиксируем при бронировании — до съёмки, а не после.',
  },
  {
    question: 'Как мы получим готовые фотографии?',
    answer:
      'Через онлайн-галерею: вы получаете ссылку, по которой можно смотреть фотографии, делиться ими и скачивать их в полном размере.',
  },
  {
    question: 'Можно ли провести съёмку за пределами города?',
    answer:
      'Да. Мы работаем в Новосибирске и Новосибирской области, выезд в другие места обсуждается индивидуально — условия согласуем заранее.',
  },
  {
    question: 'Можно ли перенести дату съёмки?',
    answer: 'Да, перенос возможен по договорённости. Чем раньше вы сообщите, тем проще подобрать новую дату.',
  },
  {
    question: 'Можно ли дополнительно заказать фотокнигу?',
    answer:
      'Да. Фотокнигу можно добавить к заказу при выборе пакета или собрать самостоятельно в конструкторе на странице фотокниг.',
  },
]

/* ---------- Order integration ---------- */

/** Labels of the page's orderable options, used by the shared order contract (config/order.ts). */
export const photographyOrderOptions = {
  packages: Object.fromEntries(photographyPackages.map((p) => [p.id, `${p.name} — ${p.title}`])),
  extras: Object.fromEntries(photographyExtras.filter((e) => e.available).map((e) => [e.id, e.title])),
  directions: Object.fromEntries(
    [...photographyMainFormats, ...photographyMoreFormats].map((f) => [f.id, f.title]),
  ),
}
