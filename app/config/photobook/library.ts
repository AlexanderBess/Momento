import type {
  CollectionId,
  DemoArt,
  DemoScene,
  LibraryImage,
  Orientation,
  PhotoLibrary,
} from '~/types/photobook'

/**
 * Themed demo libraries for the photobook studio.
 *
 * There is no upload: the configurator shows how a book could look, using these demo images.
 * While real photos are missing (`src: null`), each entry renders a procedural illustration
 * (DemoArtwork.vue) — it is obviously an illustration, never passed off as our work or as the
 * client's future print.
 *
 * To add a real photo: put an optimised file into /public/images/photobooks/<collection>/ and set
 * `src` on the entry (keep the `id` — spreads and presets reference images only by id).
 * To add an image: append a row to the collection's list below with a new unique id.
 */

type Palette = DemoArt['palette']

/* Colour moods per collection — muted, warm, editorial. */
const p = {
  // Wedding: ivory, champagne, sage, blush.
  ivory: ['#f3ece1', '#e4d6c3', '#c9b79c', '#8d7a63', '#f8f3ea'],
  blush: ['#f2e4df', '#e2c6bf', '#c99f96', '#7d5d58', '#fbf2ee'],
  sage: ['#e8eadf', '#c9cfba', '#97a184', '#5c6450', '#f4f1e8'],
  dusk: ['#d9cfe0', '#b9a9c8', '#8b7aa3', '#4a3f5c', '#f3dcc8'],
  champagne: ['#efe3cf', '#dcc5a1', '#b49771', '#6e5a43', '#fff6e6'],
  // Family: terracotta, ochre, olive, warm sand.
  terracotta: ['#f1dfcf', '#e1b99a', '#bf8361', '#7a4b33', '#fbeee2'],
  ochre: ['#f4e6c7', '#e5c98d', '#c39d55', '#7c6331', '#fff4dc'],
  olive: ['#ece9d6', '#cfcca6', '#9d9a68', '#5b5a3a', '#f8f4e4'],
  hearth: ['#efe2d4', '#d8b99c', '#a87f62', '#5a4335', '#ffe9cf'],
  // Travel: sea, sky, stone, sunset.
  sea: ['#d8e6ea', '#a9c6cf', '#5f8f9c', '#2f5560', '#f2e8d6'],
  stone: ['#ece6dc', '#d6c9b5', '#a8957a', '#5f5242', '#f6d7b8'],
  sunset: ['#f5d9c4', '#e9a98a', '#b36d5a', '#4c3a45', '#fbe7c9'],
  alpine: ['#e2e8ec', '#b8c7d1', '#7d93a3', '#3e4f5c', '#f4efe6'],
  // Little moments: pastels.
  powder: ['#e6edf3', '#c7d6e3', '#9db3c8', '#5f7389', '#fbf3e8'],
  rose: ['#f6e7e6', '#ebc9c8', '#d3a2a3', '#8a6366', '#fff5ef'],
  butter: ['#f8f0d8', '#efdca6', '#d5bb73', '#86733f', '#fffaf0'],
  lilac: ['#ede8f3', '#d6cbe6', '#ad9dc9', '#6a5d85', '#fbf6ee'],
} satisfies Record<string, Palette>

type Row = [id: string, category: string, title: string, alt: string, scene: DemoScene, palette: Palette, variant?: number]

const sceneOrientation: Record<DemoScene, Orientation> = {
  horizon: 'landscape',
  hills: 'landscape',
  city: 'landscape',
  family: 'landscape',
  arch: 'portrait',
  couple: 'portrait',
  portrait: 'portrait',
  forest: 'portrait',
  child: 'portrait',
  window: 'portrait',
  balloons: 'portrait',
  bouquet: 'square',
  rings: 'square',
  still: 'square',
}

function build(collection: CollectionId, rows: Row[]): LibraryImage[] {
  return rows.map(([id, category, title, alt, scene, palette, variant = 0]) => ({
    id: `${collection}-${id}`,
    collection,
    category,
    title,
    alt,
    orientation: sceneOrientation[scene],
    src: null,
    art: { scene, palette, variant },
  }))
}

/* ---------- Wedding Story ---------- */

const wedding: PhotoLibrary = {
  collection: 'wedding',
  label: 'Wedding Story',
  categories: [
    { id: 'ceremony', label: 'Церемония' },
    { id: 'couple', label: 'Портреты пары' },
    { id: 'lovestory', label: 'Love Story' },
    { id: 'details', label: 'Детали' },
    { id: 'guests', label: 'Гости и эмоции' },
    { id: 'decor', label: 'Декор' },
  ],
  images: build('wedding', [
    ['arch', 'ceremony', 'Арка церемонии', 'Свадебная арка в тёплом свете', 'arch', p.ivory],
    ['shore', 'ceremony', 'Церемония у воды', 'Церемония на берегу на закате', 'horizon', p.champagne, 1],
    ['chapel', 'ceremony', 'Свет в зале', 'Мягкий свет из высокого окна', 'window', p.ivory, 1],
    ['aisle', 'ceremony', 'Проход', 'Арка в саду', 'arch', p.sage, 2],
    ['vows', 'couple', 'Двое', 'Пара стоит рядом', 'couple', p.blush],
    ['dusk', 'couple', 'Вечерний портрет', 'Пара в вечернем свете', 'couple', p.dusk, 1],
    ['bride', 'couple', 'Портрет невесты', 'Портрет в мягком свете', 'portrait', p.ivory],
    ['embrace', 'couple', 'Объятия', 'Пара обнимается', 'couple', p.champagne, 2],
    ['field', 'lovestory', 'Прогулка в поле', 'Холмы на рассвете', 'hills', p.sage],
    ['sea', 'lovestory', 'У моря', 'Горизонт и солнце над морем', 'horizon', p.blush],
    ['grove', 'lovestory', 'Роща', 'Светлая роща', 'forest', p.sage, 1],
    ['sunset', 'lovestory', 'Закат', 'Пара на фоне заката', 'couple', p.dusk, 3],
    ['rings', 'details', 'Кольца', 'Обручальные кольца', 'rings', p.champagne],
    ['bouquet', 'details', 'Букет', 'Свадебный букет', 'bouquet', p.blush],
    ['table', 'details', 'Сервировка', 'Детали сервировки', 'still', p.ivory],
    ['rings-2', 'details', 'Кольца на ткани', 'Кольца на шёлке', 'rings', p.blush, 1],
    ['toast', 'guests', 'Гости', 'Гости за праздничным столом', 'family', p.champagne, 2],
    ['friends', 'guests', 'Друзья', 'Друзья пары', 'family', p.blush, 1],
    ['laugh', 'guests', 'Эмоции', 'Гостья смеётся', 'portrait', p.champagne, 1],
    ['dance', 'guests', 'Первый танец', 'Пара в танце', 'couple', p.ivory, 1],
    ['flowers', 'decor', 'Цветы', 'Цветочная композиция', 'bouquet', p.sage, 1],
    ['candles', 'decor', 'Свечи', 'Свечи и посуда', 'still', p.champagne, 1],
    ['hall', 'decor', 'Зал', 'Высокие окна зала', 'window', p.blush],
    ['garden', 'decor', 'Сад', 'Арка из зелени', 'arch', p.blush, 1],
  ]),
}

/* ---------- Family Moments ---------- */

const family: PhotoLibrary = {
  collection: 'family',
  label: 'Family Moments',
  categories: [
    { id: 'portraits', label: 'Семейные портреты' },
    { id: 'parents', label: 'Родители и дети' },
    { id: 'walks', label: 'Прогулки' },
    { id: 'home', label: 'Дома' },
    { id: 'kids', label: 'Дети' },
  ],
  images: build('family', [
    ['together', 'portraits', 'Все вместе', 'Семья на лугу', 'family', p.ochre],
    ['evening', 'portraits', 'Вечер', 'Семья на закате', 'family', p.terracotta, 1],
    ['porch', 'portraits', 'На крыльце', 'Семья у дома', 'family', p.hearth, 2],
    ['mother', 'portraits', 'Портрет мамы', 'Портрет в тёплом свете', 'portrait', p.terracotta],
    ['hands', 'parents', 'Рядом', 'Родитель и ребёнок', 'couple', p.ochre, 2],
    ['father', 'parents', 'С папой', 'Папа и ребёнок', 'child', p.olive, 1],
    ['hug', 'parents', 'Объятия', 'Мама обнимает ребёнка', 'couple', p.hearth, 1],
    ['meadow', 'walks', 'Луг', 'Холмы и луг', 'hills', p.olive],
    ['park', 'walks', 'Парк', 'Деревья в парке', 'forest', p.ochre],
    ['lake', 'walks', 'Озеро', 'Тихое озеро', 'horizon', p.olive, 2],
    ['autumn', 'walks', 'Осень', 'Осенние холмы', 'hills', p.terracotta, 1],
    ['kitchen', 'home', 'Кухня', 'Утро на кухне', 'still', p.hearth],
    ['window', 'home', 'У окна', 'Свет из окна', 'window', p.ochre],
    ['tea', 'home', 'Чаепитие', 'Чашки на столе', 'still', p.terracotta, 1],
    ['flowers', 'home', 'Цветы', 'Букет в вазе', 'bouquet', p.olive],
    ['run', 'kids', 'Бег', 'Ребёнок бежит по лугу', 'child', p.ochre],
    ['balloons', 'kids', 'Шары', 'Ребёнок с шарами', 'balloons', p.terracotta],
    ['smile', 'kids', 'Улыбка', 'Детский портрет', 'portrait', p.ochre, 1],
    ['game', 'kids', 'Игра', 'Дети играют', 'family', p.olive, 3],
    ['sunny', 'kids', 'Солнечный день', 'Ребёнок на солнце', 'child', p.hearth, 2],
  ]),
}

/* ---------- Travel Journal ---------- */

const travel: PhotoLibrary = {
  collection: 'travel',
  label: 'Travel Journal',
  categories: [
    { id: 'landscapes', label: 'Пейзажи' },
    { id: 'architecture', label: 'Архитектура' },
    { id: 'city', label: 'Города' },
    { id: 'nature', label: 'Природа' },
    { id: 'journey', label: 'В пути' },
    { id: 'details', label: 'Детали поездок' },
  ],
  images: build('travel', [
    ['coast', 'landscapes', 'Побережье', 'Морской горизонт', 'horizon', p.sea],
    ['peaks', 'landscapes', 'Горы', 'Горные хребты', 'hills', p.alpine, 2],
    ['dunes', 'landscapes', 'Дюны', 'Холмы на закате', 'hills', p.sunset, 1],
    ['bay', 'landscapes', 'Залив', 'Закат над заливом', 'horizon', p.sunset, 1],
    ['arcade', 'architecture', 'Аркада', 'Каменная арка', 'arch', p.stone],
    ['cloister', 'architecture', 'Галерея', 'Арка и небо', 'arch', p.sea, 1],
    ['facade', 'architecture', 'Фасад', 'Окна старого дома', 'window', p.stone, 2],
    ['dome', 'architecture', 'Купол', 'Арка на закате', 'arch', p.sunset, 2],
    ['skyline', 'city', 'Панорама', 'Городская панорама', 'city', p.alpine],
    ['old-town', 'city', 'Старый город', 'Крыши старого города', 'city', p.stone, 1],
    ['night', 'city', 'Вечерний город', 'Город в сумерках', 'city', p.dusk, 2],
    ['harbour', 'city', 'Гавань', 'Город у воды', 'city', p.sea, 3],
    ['pines', 'nature', 'Сосны', 'Сосновый лес', 'forest', p.alpine],
    ['valley', 'nature', 'Долина', 'Зелёная долина', 'hills', p.olive, 3],
    ['lake', 'nature', 'Горное озеро', 'Озеро в горах', 'horizon', p.alpine, 2],
    ['wander', 'journey', 'Путник', 'Путешественник смотрит вдаль', 'portrait', p.sea, 2],
    ['two', 'journey', 'Вдвоём', 'Двое в дороге', 'couple', p.sunset, 2],
    ['road', 'journey', 'Дорога', 'Дорога через холмы', 'hills', p.stone],
    ['crew', 'journey', 'Компания', 'Друзья в поездке', 'family', p.sea, 1],
    ['map', 'details', 'Карта', 'Предметы путешественника', 'still', p.stone, 2],
    ['coffee', 'details', 'Кофе', 'Кофе в уличном кафе', 'still', p.sunset],
    ['shells', 'details', 'Ракушки', 'Ракушки на песке', 'rings', p.stone, 2],
    ['postcard', 'details', 'Открытка', 'Цветы у окна', 'bouquet', p.sea, 2],
    ['shutters', 'details', 'Ставни', 'Окно со ставнями', 'window', p.sea, 3],
  ]),
}

/* ---------- Little Moments ---------- */

const little: PhotoLibrary = {
  collection: 'little',
  label: 'Little Moments',
  categories: [
    { id: 'newborn', label: 'Новорождённые' },
    { id: 'portraits', label: 'Детские портреты' },
    { id: 'family', label: 'Семья' },
    { id: 'details', label: 'Детали' },
    { id: 'firsts', label: 'Первые моменты' },
  ],
  images: build('little', [
    ['sleep', 'newborn', 'Сон', 'Мягкий утренний свет', 'window', p.powder, 1],
    ['tiny', 'newborn', 'Первые дни', 'Нежный портрет', 'portrait', p.rose, 3],
    ['blanket', 'newborn', 'Плед', 'Пастельный текстиль', 'still', p.butter, 3],
    ['curious', 'portraits', 'Любопытство', 'Детский портрет', 'portrait', p.powder, 1],
    ['giggle', 'portraits', 'Смех', 'Ребёнок смеётся', 'portrait', p.butter],
    ['dreamer', 'portraits', 'Мечтатель', 'Ребёнок у окна', 'child', p.lilac, 2],
    ['bloom', 'portraits', 'Весна', 'Ребёнок на лугу', 'child', p.rose],
    ['parents', 'family', 'Мама и папа', 'Родители с малышом', 'family', p.rose, 1],
    ['picnic', 'family', 'Пикник', 'Семья на пикнике', 'family', p.butter],
    ['cuddle', 'family', 'Обнимашки', 'Мама обнимает малыша', 'couple', p.lilac, 1],
    ['toys', 'details', 'Игрушки', 'Детские игрушки', 'still', p.powder, 1],
    ['flowers', 'details', 'Цветы', 'Пастельный букет', 'bouquet', p.rose, 2],
    ['booties', 'details', 'Пинетки', 'Детские мелочи', 'rings', p.butter, 3],
    ['first-steps', 'firsts', 'Первые шаги', 'Малыш делает первые шаги', 'child', p.butter, 1],
    ['birthday', 'firsts', 'Первый день рождения', 'Шары на празднике', 'balloons', p.lilac],
    ['sea', 'firsts', 'Первое море', 'Море в пастельных тонах', 'horizon', p.powder, 3],
    ['walk', 'firsts', 'Первая прогулка', 'Пастельные холмы', 'hills', p.rose, 3],
    ['party', 'firsts', 'Праздник', 'Воздушные шары', 'balloons', p.powder, 1],
  ]),
}

export const photoLibraries: Record<CollectionId, PhotoLibrary> = { wedding, family, travel, little }

const imageIndex = new Map<string, LibraryImage>(
  Object.values(photoLibraries).flatMap((library) => library.images.map((image) => [image.id, image] as const)),
)

export function findImage(id: string | undefined): LibraryImage | undefined {
  return id ? imageIndex.get(id) : undefined
}
