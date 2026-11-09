import type { ImageAsset } from '~/types/service'
import type { EventType } from './order'

/**
 * Content of the AI photo booth page (/services/booth).
 *
 * Rules for this file:
 * - Equipment facts come only from the manufacturer page https://dzentech.ru/klassika/
 *   and are labelled as manufacturer data. Our own kit (camera, monitor, printer) is not
 *   confirmed yet — those fields stay `null` and are simply not rendered.
 * - No prices, no ratings, no guaranteed delivery channels (QR, e-mail) until confirmed.
 * - Images are `src: null` until real photos exist (see docs/IMAGES.md) — PhotoFrame then
 *   renders a clearly marked placeholder.
 */

/* ---------- Hero ---------- */

export type HeroPortraitRole = 'main' | 'fantasy' | 'fashion' | 'original'

export interface HeroPortrait {
  role: HeroPortraitRole
  /**
   * Editorial style label. Keep it only if the image really shows this style —
   * when replacing an image, update or remove the label (`null` hides it).
   */
  label: string | null
  image: ImageAsset
}

/**
 * Hero collage: AI portraits, not the booth itself (the booth lives in the Equipment section).
 * Positions are set in BoothHero.vue by `role`; content is here.
 * Placeholders until real AI results from our booth exist (with consent of the people shown).
 */
export const boothHeroPortraits: HeroPortrait[] = [
  {
    role: 'main',
    label: 'Cinematic portrait',
    image: { src: null, alt: 'Гость в кинематографичном AI-образе', width: 1200, height: 1500 },
  },
  {
    role: 'fantasy',
    label: 'Fantasy world',
    image: { src: null, alt: 'Гость в фэнтезийном AI-образе', width: 900, height: 1200 },
  },
  {
    role: 'fashion',
    label: 'Fashion editorial',
    image: { src: null, alt: 'Гостья в образе с обложки модного журнала', width: 900, height: 1200 },
  },
  {
    role: 'original',
    label: 'Оригинал',
    image: { src: null, alt: 'Исходное фото гостя из фотобудки', width: 1000, height: 1250 },
  },
]

export const boothHeroBenefits = [
  'AI-преображение фотографий',
  'Для частных и корпоративных мероприятий',
  'Индивидуальное оформление',
] as const

/* ---------- Before / After ---------- */

export interface TransformationExample {
  id: string
  /** Short style name shown on the switcher. */
  label: string
  /** Pair of images with identical proportions. */
  before: ImageAsset
  after: ImageAsset
}

export const transformationExamples: TransformationExample[] = [
  {
    id: 'cinematic',
    label: 'Кино',
    before: { src: null, alt: 'Исходное фото гостя в фотобудке', width: 1200, height: 1500 },
    after: { src: null, alt: 'Тот же гость в кинематографичном AI-образе', width: 1200, height: 1500 },
  },
  {
    id: 'retro',
    label: 'Ретро',
    before: { src: null, alt: 'Исходное фото пары гостей', width: 1200, height: 1500 },
    after: { src: null, alt: 'Та же пара в ретро-образе', width: 1200, height: 1500 },
  },
  {
    id: 'art',
    label: 'Арт',
    before: { src: null, alt: 'Исходное фото гостьи', width: 1200, height: 1500 },
    after: { src: null, alt: 'Та же гостья в художественном AI-образе', width: 1200, height: 1500 },
  },
]

/* ---------- Event types ---------- */

export interface BoothEventCard {
  type: EventType
  title: string
  text: string
  image: ImageAsset
}

export const boothEventCards: BoothEventCard[] = [
  {
    type: 'wedding',
    title: 'Свадьбы',
    text: 'Гости получают необычные портреты, а вы — ещё одну историю о своём дне.',
    image: { src: null, alt: 'Гости свадьбы у фотобудки', width: 1200, height: 1500 },
  },
  {
    type: 'birthday',
    title: 'Дни рождения',
    text: 'Развлечение, которое объединяет гостей любого возраста.',
    image: { src: null, alt: 'Гости дня рождения рассматривают AI-портреты', width: 1200, height: 1200 },
  },
  {
    type: 'private',
    title: 'Частные события',
    text: 'Юбилеи, выпускные и семейные праздники в новом формате.',
    image: { src: null, alt: 'Семейный праздник с фотобудкой', width: 1200, height: 1200 },
  },
  {
    type: 'corporate',
    title: 'Корпоративы',
    text: 'Активность, которая помогает коллегам расслабиться и пообщаться.',
    image: { src: null, alt: 'Коллеги у фотобудки на корпоративе', width: 1200, height: 1200 },
  },
  {
    type: 'brand',
    title: 'Бренд-мероприятия',
    text: 'Интерактив для выставок, презентаций и промоакций.',
    image: { src: null, alt: 'Фотобудка на стенде бренда', width: 1200, height: 1200 },
  },
]

/* ---------- How it works ---------- */

export interface BoothStep {
  title: string
  text: string
  icon: 'camera' | 'style' | 'processing' | 'result'
}

/** Step 04 deliberately does not name a delivery channel: it depends on the event's kit. */
export const boothSteps: BoothStep[] = [
  { icon: 'camera', title: 'Фотография', text: 'Гость встаёт перед фотобудкой и делает снимок.' },
  { icon: 'style', title: 'Выбор образа', text: 'На экране гость выбирает один из подготовленных AI-стилей.' },
  { icon: 'processing', title: 'Обработка', text: 'Программа MixUp App превращает фотографию в новый образ.' },
  {
    icon: 'result',
    title: 'Результат',
    text: 'Гость получает готовое изображение способом, который мы согласуем для вашего мероприятия.',
  },
]

/* ---------- AI gallery ---------- */

export type GalleryCategory = 'cinematic' | 'fantasy' | 'vintage' | 'fashion' | 'characters'

/** Demo categories — visual directions, not a confirmed list of MixUp App styles. */
export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  cinematic: 'Кино',
  fantasy: 'Фэнтези',
  vintage: 'Винтаж',
  fashion: 'Фэшн',
  characters: 'Персонажи',
}

export interface GalleryItem {
  id: string
  category: GalleryCategory
  image: ImageAsset
}

const portrait = (id: string, category: GalleryCategory, alt: string, height = 1600): GalleryItem => ({
  id,
  category,
  image: { src: null, alt, width: 1200, height },
})

export const boothGallery: GalleryItem[] = [
  portrait('cinematic-1', 'cinematic', 'AI-портрет в стиле кинокадра', 1600),
  portrait('fantasy-1', 'fantasy', 'AI-образ в фэнтезийном стиле', 1200),
  portrait('vintage-1', 'vintage', 'AI-портрет в винтажной стилистике', 1500),
  portrait('fashion-1', 'fashion', 'AI-образ в стиле модной съёмки', 1600),
  portrait('characters-1', 'characters', 'Гость в образе персонажа', 1200),
  portrait('cinematic-2', 'cinematic', 'Групповой AI-портрет в стиле кино', 1200),
  portrait('fantasy-2', 'fantasy', 'Сказочный AI-портрет', 1600),
  portrait('vintage-2', 'vintage', 'Портрет в духе старой фотографии', 1200),
  portrait('fashion-2', 'fashion', 'AI-образ для обложки журнала', 1500),
  portrait('characters-2', 'characters', 'Пара гостей в образах персонажей', 1600),
]

/** Items rendered before «Показать ещё». Keeps the first load light. */
export const GALLERY_PAGE_SIZE = 6

/* ---------- Business ---------- */

export const boothBusinessImage: ImageAsset = {
  src: null,
  alt: 'AI-фотобудка на корпоративном мероприятии',
  width: 1600,
  height: 1200,
}

export const boothBusinessPoints: { title: string; text: string }[] = [
  { title: 'Корпоративы и праздники команды', text: 'Общая активность, вокруг которой собираются коллеги.' },
  { title: 'Брендирование', text: 'Оформление корпуса и экрана в фирменном стиле компании.' },
  { title: 'Сценарии под задачу', text: 'Подбор AI-образов под тему события, продукта или кампании.' },
  { title: 'Выставки и презентации', text: 'Интерактив, который привлекает посетителей к стенду.' },
]

/* ---------- Equipment ---------- */

export const boothEquipment = {
  name: 'DZEN TECH «Классика»',
  software: 'MixUp App',
  sourceUrl: 'https://dzentech.ru/klassika/',
  image: { src: null, alt: 'Фотобудка DZEN TECH «Классика»', width: 1000, height: 1500 } satisfies ImageAsset,
  description:
    'Фотобудка с разборным алюминиевым каркасом: камера, студийный свет и экран установлены внутри корпуса. Внешний вид меняется сменными панелями.',
}

export interface EquipmentSpec {
  label: string
  value: string
}

/** Manufacturer data (dzentech.ru). Add only values that are confirmed for the kit we bring. */
export const boothEquipmentSpecs: EquipmentSpec[] = [
  { label: 'Размеры', value: '475 × 370 × 1830 мм' },
  { label: 'Вес', value: '16,3 кг' },
  { label: 'Конструкция', value: 'Две разборные части, регулируемые ножки' },
  { label: 'Сборка корпуса', value: 'Около 5 минут' },
  { label: 'Экран', value: 'Монитор до 24″' },
  { label: 'Оформление', value: 'Сменные ПВХ-панели на магнитах' },
]

/** Our own kit — fill in once confirmed. `null` values are not rendered. */
export const boothKit: { camera: string | null; monitor: string | null; printer: string | null } = {
  camera: null,
  monitor: null,
  printer: null,
}

export interface EquipmentHotspot {
  id: string
  /** Position on the equipment image, in % of its width / height. */
  x: number
  y: number
  title: string
  text: string
}

/** Positions are approximate and must be re-aligned once the real photo is added. */
export const boothHotspots: EquipmentHotspot[] = [
  {
    id: 'screen',
    x: 50,
    y: 30,
    title: 'Экран',
    text: 'Монитор до 24″: гость видит себя и выбирает образ.',
  },
  {
    id: 'camera',
    x: 50,
    y: 12,
    title: 'Камера и свет',
    text: 'Камера и студийный свет установлены внутри корпуса.',
  },
  {
    id: 'body',
    x: 50,
    y: 68,
    title: 'Корпус',
    text: 'Разборный алюминиевый каркас из двух частей со сменными панелями.',
  },
]

/* ---------- Customization ---------- */

export interface CustomizationOption {
  id: string
  label: string
  text: string
  image: ImageAsset
}

export const boothCustomization: CustomizationOption[] = [
  {
    id: 'panels',
    label: 'Сменные панели',
    text: 'Облицовка корпуса меняется без переделки конструкции — под стиль праздника или интерьер площадки.',
    image: { src: null, alt: 'Фотобудка со сменными декоративными панелями', width: 1200, height: 1500 },
  },
  {
    id: 'screen',
    label: 'Оформление экрана',
    text: 'Рамка вокруг экрана оформляется отдельно от корпуса, поэтому варианты можно сочетать.',
    image: { src: null, alt: 'Декоративное оформление экрана фотобудки', width: 1200, height: 1500 },
  },
  {
    id: 'brand',
    label: 'Брендирование',
    text: 'Для компаний — панели с логотипом и фирменными цветами. Макет согласуем заранее.',
    image: { src: null, alt: 'Фотобудка в фирменном оформлении компании', width: 1200, height: 1500 },
  },
  {
    id: 'concept',
    label: 'Своя концепция',
    text: 'Подбираем оформление и AI-образы под общую идею мероприятия.',
    image: { src: null, alt: 'Фотобудка, оформленная под тему мероприятия', width: 1200, height: 1500 },
  },
]

/* ---------- FAQ ---------- */

export interface FaqItem {
  question: string
  answer: string
}

/** Neutral answers only — final terms are agreed per request. */
export const boothFaq: FaqItem[] = [
  {
    question: 'Сколько времени занимает установка фотобудки?',
    answer:
      'По данным производителя корпус собирается примерно за 5 минут. С подключением и проверкой оборудования мы приезжаем заранее, чтобы всё было готово к началу мероприятия. Время заезда согласуем с вами и площадкой.',
  },
  {
    question: 'Можно ли выбрать собственные AI-стили?',
    answer:
      'Мы заранее подбираем набор образов под формат и тему мероприятия. Возможность подготовить индивидуальный сценарий обсуждается при оформлении заявки.',
  },
  {
    question: 'Как гости получают фотографии?',
    answer:
      'Способ получения зависит от комплектации на вашем мероприятии. Варианты мы согласуем при обсуждении заявки.',
  },
  {
    question: 'Можно ли заказать брендирование?',
    answer:
      'Да, корпус оформляется сменными панелями. Брендирование под компанию или мероприятие обсуждается отдельно: сроки и стоимость зависят от макета.',
  },
  {
    question: 'Что входит в аренду?',
    answer:
      'Доставка, установка и работа фотобудки на мероприятии. Точный состав и продолжительность зависят от выбранного формата — мы предложим варианты после заявки.',
  },
  {
    question: 'Можно ли заказать печать фотографий?',
    answer:
      'Фотобудка поддерживает подключение фотопринтера. Печать — дополнительная опция: наличие и условия уточняются при оформлении заявки.',
  },
  {
    question: 'Для каких мероприятий подходит фотобудка?',
    answer:
      'Для свадеб, дней рождения, семейных и частных праздников, корпоративов, конференций, выставок и бренд-мероприятий.',
  },
  {
    question: 'Сколько стоит аренда?',
    answer:
      'Стоимость зависит от даты, продолжительности, места проведения и дополнительных опций. Оставьте заявку — мы рассчитаем стоимость под ваше мероприятие.',
  },
]
