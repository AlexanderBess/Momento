# MOMENTO — сайт event-фотосервиса

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS 4.

## Требования

- Node.js **24.15+** (зафиксировано в `.nvmrc`: `nvm install 24.22.2 && nvm use 24.22.2`)
- npm 11+

## Запуск

```bash
npm install
npm run dev          # http://localhost:3000
```

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run typecheck` | проверка типов (vue-tsc) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run build` | production-сборка (Node-сервер) |
| `npm run generate` | статическая сборка в `.output/public` |
| `npm run check` | lint + typecheck + build |

## Структура

```text
app/
  assets/css/     tokens.css (дизайн-токены, @theme), animations.css, main.css
  components/
    layout/       AppHeader, AppFooter, MobileNavigation, AppLogo
    ui/           BaseButton, SectionHeading, PhotoFrame, PageStub
  composables/    useInView
  config/         brand.ts, navigation.ts, services.ts — весь контент и данные бренда
  pages/          маршруты (services/[slug].vue — общая страница услуги)
  plugins/        reveal.ts — директива v-reveal
  types/
docs/IMAGES.md    структура изображений и список требуемых фото
```

## Где что менять

- **Название бренда, контакты, соцсети, реквизиты** — `app/config/brand.ts`. Пустые (`null`) поля не выводятся.
- **Меню и футер** — `app/config/navigation.ts`.
- **Услуги** — `app/config/services.ts`.
- **Цвета, шрифты, радиусы, motion** — `app/assets/css/tokens.css`. Каждая переменная из `@theme`
  доступна как CSS-переменная и как Tailwind-утилита (`bg-surface`, `text-muted`, `rounded-card`, `ease-enter`).

## Анимации

- `v-reveal` / `v-reveal="index * 80"` — появление при прокрутке (один общий IntersectionObserver).
  Без JS и при `prefers-reduced-motion` контент виден сразу.
- `useInView(el)` — флаг видимости, например чтобы ставить декоративные анимации на паузу (`motion-paused`).
- Анимируются только `opacity` и `transform`.

## Решения и отклонения от ТЗ

- **Nuxt 4** вместо Nuxt 3: ветка 3.x в режиме поддержки, а структура `app/` из ТЗ — это раскладка Nuxt 4.
- **TypeScript 5.9** закреплён: TypeScript 7 (нативный компилятор) пока не совместим с `vue-tsc`.
- **`--color-muted` = `#6E645B`**: цвет `#81766D` из ТЗ даёт контраст 3.9:1 на фоне (WCAG AA требует 4.5:1).
  Исходный цвет сохранён как `--color-muted-soft` для иконок, декора и крупного текста.
- **`BaseIcon` не создан**: компоненты Lucide уже принимают `size` и `stroke-width`, обёртка была бы лишней.
- **Страницы услуг** — одна динамическая `services/[slug].vue` по данным из конфига.
  Если услуге понадобится уникальный макет, файл `services/booth.vue` перекроет динамический маршрут.
- Добавлена страница **`/faq`**: пункт FAQ есть в навигации ТЗ.
- Корзина в шапке ведёт на заглушку `/checkout`. Работающей корзины, отправки заявок и бронирования
  на этом этапе нет намеренно.
