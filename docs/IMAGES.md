# Изображения: структура и список требуемых фото

Пока реальных фотографий нет, сайт показывает нейтральные плейсхолдеры с явной подписью
«Демо · фото будет добавлено» (компонент `PhotoFrame`). Демонстрационные материалы
не выдаются за работы бренда.

## Куда класть файлы

```text
public/images/
  hero/        главный экран
  services/    карточки услуг (4 шт.)
  booth/       блок AI-фотобудки
  portfolio/   галерея портфолио
```

Исходники — JPEG или PNG максимального качества: `@nuxt/image` сам сожмёт их и выдаст AVIF/WebP
нужного размера. Минимум 2400 px по длинной стороне для hero, 1600 px для остальных.

Чтобы подключить фото, укажите путь в `src` и реальные `width`/`height`:

```ts
// app/config/services.ts
image: { src: '/images/services/booth.jpg', alt: 'Гости у AI-фотобудки на свадьбе', width: 1600, height: 2000 }
```

Только собственные фото или снимки с лицензией на коммерческое использование.
На фото с людьми нужно их согласие на публикацию.

## Что нужно снять или подобрать

| Блок | Кадр | Формат | Кол-во |
|---|---|---|---|
| Hero | Эмоциональный живой момент праздника (семья, объятия, смех), тёплый свет | вертикаль ~6:7 | 1–2 |
| Услуги → AI-фотобудка | Будка на мероприятии, гости взаимодействуют с экраном | вертикаль 4:5 | 1 |
| Услуги → Фотосъёмка | Фотограф в работе или репортажный кадр события | вертикаль 4:5 | 1 |
| Услуги → Фотозоны | Готовая фотозона: арка, декор, свет | вертикаль 4:5 | 1 |
| Услуги → Фотокниги | Раскрытая фотокнига, крупный план, мягкий свет | вертикаль 4:5 | 1 |
| AI-фотобудка | Примеры реальных AI-образов с вашего оборудования (с согласия людей) | вертикаль 3:4 | 3–5 |
| AI-фотобудка | Само оборудование | любая | 1 |
| Портфолио | Свадьбы, дни рождения, корпоративы, детские праздники, фотозоны, фотокниги | смешанные | 12+ |
| О нас | Команда / семья за работой | горизонталь | 1–2 |

Стиль: тёплый естественный свет, светлые нейтральные фоны, живые эмоции, без кричащих фильтров.

## Страница AI-фотобудки (`/services/booth`)

Все пути и `alt` — в `app/config/booth.ts`. Для каждой пары «до / после» оба файла должны иметь одинаковые пропорции.

| Блок | Кадр | Формат | Кол-во |
|---|---|---|---|
| Hero (коллаж) | 3 AI-образа разных стилей (кино, фэнтези, фэшн) + исходный кадр одного из гостей. Подписи стилей в `boothHeroPortraits` должны соответствовать фото | вертикаль 4:5 и 3:4 | 4 |
| До / после | Исходный кадр из будки и AI-результат того же человека (с согласия) | вертикаль 4:5, пары | 3 пары |
| Типы событий | Свадьба, день рождения, частный праздник, корпоратив, бренд-стенд | 16:10 / 4:5 | 5 |
| Галерея образов | AI-образы по категориям (только реально доступные стили) | вертикаль, разная высота | 10+ |
| Для бизнеса | Корпоративное мероприятие с будкой | горизонталь 4:3 | 1 |
| Оборудование | Реальное фото DZEN TECH «Классика» в полный рост; после замены поправить координаты hotspot-точек | вертикаль 2:3 | 1 |
| Оформление | Будка со сменными панелями, оформлением экрана, брендированием, тематическим декором | 4:3 | 4 |

## Страница фотокниг (`/services/photobooks`)

Конструктор работает на библиотеке демонстрационных изображений (`app/config/photobook/library.ts`).
Пока у записи `src: null`, вместо фото рисуется процедурная иллюстрация (`DemoArtwork.vue`) — она
очевидно иллюстративна и не выдаётся за наши работы. Чтобы подключить фото, положите файл в
`public/images/photobooks/<коллекция>/` и укажите путь в `src`. **`id` не меняйте** — по нему на фото
ссылаются развороты и пресеты.

| Блок | Кадр | Формат | Кол-во |
|---|---|---|---|
| Библиотека Wedding Story | Церемония, портреты пары, Love Story, детали, гости, декор | разные: горизонт., вертик., квадрат | 24 |
| Библиотека Family Moments | Семейные портреты, родители и дети, прогулки, дом, дети | разные | 20 |
| Библиотека Travel Journal | Пейзажи, архитектура, города, природа, в пути, детали | разные | 24 |
| Библиотека Little Moments | Новорождённые, детские портреты, семья, детали, первые моменты | разные | 18 |
| Материалы | Макро образцов ткани и кожзама, бумаги, переплёта, готовые развороты | 4:3 / 16:9 | 6+ |

Ориентацию (`orientation`) у записи держите в соответствии с реальным кадром — по ней фото
подбираются в слоты макетов. Для библиотеки нужны фото с правом коммерческого использования и
согласием изображённых людей.

### Hero страницы фотокниг — фото продукта

Пути, `alt` и размеры — в `app/config/photobook/hero.ts`, файлы — в `public/images/photobooks/hero/`.
Каждый объект — **отдельный вырезанный кадр на прозрачном фоне** (PNG или WebP с альфа-каналом),
чтобы книги можно было позиционировать и анимировать независимо. Пока у объекта `src: null`,
hero показывает отрисованную книгу; фото подменяет её автоматически.

| Файл | Что | Размер | Обязательно |
|---|---|---|---|
| `open-book.webp` | Раскрытая фотокнига, лежит на столе | 2000 × 1500 (4:3) | да |
| `closed-milk.webp`, `closed-sand.webp`, `closed-violet.webp`, `closed-graphite.webp` | Закрытая книга в четырёх цветах ткани, **одинаковые ракурс, свет и кадрирование** | 1200 × 1500 (4:5) | все четыре, иначе показывается отрисованная книга |
| `print-1.webp`, `print-2.webp` | Два отпечатка с белым полем | 800 × 1000 (4:5) | нет; без них при фото-книгах отпечатки не показываются |

После добавления файлов: укажите `src` и реальные `width`/`height` в `hero.ts`.
Книга должна заполнять кадр почти целиком (поля 3–5 %), низ книги — у нижнего края кадра:
объекты выравниваются по низу (`object-position: bottom`).

**Промпты для генератора изображений** (английский текст работает стабильнее). Перед
использованием проверьте условия генератора: изображения должны быть разрешены для коммерческого
использования, без узнаваемых реальных людей, без текста, логотипов и водяных знаков.

1. Открытая книга (`open-book`):

   > Premium product photograph of a large square open layflat photobook lying on a pale warm table,
   > camera in front of the book looking down at about 35 degrees, book rotated slightly counter-clockwise,
   > both pages fully visible, natural soft daylight from the upper left, gentle realistic contact shadow.
   > Left page: one full-bleed warm photograph of a couple walking at golden hour, faces not recognisable.
   > Right page: two smaller photographs on white matte paper with margins — a calm seascape at sunset and
   > a close-up of wedding rings on linen. Realistic centre fold, visible page-block thickness, sand-coloured
   > linen hardcover edge under the pages. Neutral ivory and beige tones, editorial still life, high detail,
   > no text, no logos, no watermark, isolated on plain background for cut-out.

2. Закрытая книга (`closed-sand`, затем остальные цвета):

   > Premium product photograph of a closed square photobook standing upright, three-quarter view turned
   > about 25 degrees so the front cover and the spine on the left are both visible, sand-beige natural
   > linen bookcloth hardcover with visible woven texture, rounded realistic spine, cream page block visible
   > at the top edge, soft daylight from the upper left, subtle shadow on the ground, no text on the cover,
   > no logos, no watermark, isolated on plain background for cut-out, high detail.

   Остальные варианты получите **редактированием этого же кадра** (inpaint/«изменить цвет обложки»), а
   не новой генерацией — иначе ракурс разъедется и смена цвета будет «прыгать»:
   «change only the bookcloth colour to milky off-white / dusty muted violet / deep graphite grey,
   keep the texture, lighting, angle and everything else identical». Ориентиры цвета — `covers.ts`
   (milk `#ECE5D8`, sand `#D4C3A6`, violet `#857AA0`, graphite `#3B3835`).

3. Отпечатки (необязательно):

   > Single loose photographic print with a white border lying flat, slightly rotated, top-down view,
   > soft shadow, [a bouquet of pale roses | misty green hills at dawn], natural colours, no text,
   > isolated on plain background for cut-out.

Фон удалите в редакторе (если генератор не отдаёт прозрачность), сохраните в WebP с альфа-каналом.
Сжатие и AVIF/WebP нужных размеров `@nuxt/image` сделает сам.
