# MOMENTO

MOMENTO is a Russian-language event-services website for Novosibirsk and Berdsk, built with Nuxt 4, Vue 3, TypeScript and Tailwind CSS 4.

## Development

Use Node.js 24.22.2 from `.nvmrc` and npm 11+. Install the locked packages with `npm ci`, then use `npm run dev` to start the local server.

| Command | Purpose |
|---|---|
| `npm run lint` | Check ESLint rules. `npm run lint:fix` applies edits. |
| `npm run typecheck` | Check the application, server and shared TypeScript projects. |
| `npm run build` | Build the production Nitro server and public assets. |
| `npm run preview` | Preview the production build locally. |
| `npm run generate` | Produce static output for previews. Production inquiries require the running Nitro handler. |
| `npm run check` | Run lint, typecheck and build in sequence. |

The build uses Google Fonts for Manrope and Cormorant Garamond. Place Telegram configuration in the private server environment as described in `.env.example`. For local transport checks, use a local stub and disposable credentials.

## Where to make changes

| Area | Location |
|---|---|
| Brand, region, contacts, legal details and social links | `app/config/brand.ts`. The footer omits empty contact fields. |
| Header, footer and catalog navigation | `app/config/navigation.ts` and `app/config/services.ts`. |
| Service content and options | `app/config/booth.ts`, `photography.ts`, `photozones.ts` and the `photobook/` directory alongside them. The booth kit fields are reserved for confirmed equipment details. |
| Pages and layout | `app/pages/` and `app/layouts/default.vue`. Four explicit service pages take precedence over `app/pages/services/[slug].vue`. |
| Selection and inquiries | `app/lib/selection.ts`, `app/composables/useCart.ts`, `app/pages/checkout.vue`, `shared/lead.ts` and `server/api/leads.post.ts`. The old `/order` URL redirects to checkout. |
| Components and interaction | `app/components/` contains shared UI, layout and service components. The header opens the selection drawer. Use Lucide components directly for icons. |
| Design and motion | `app/assets/css/tokens.css` defines colours, type, radii, timings and service themes. The muted text and muted-soft decorative colours serve different contrast needs. `app/plugins/reveal.ts` and `useInView` handle scroll reveals and in-view state, including reduced-motion behavior. |
| Images | `public/images/` contains local assets. Use the [image brief](docs/IMAGES.md) for locations and intended crops. |

The project uses Nuxt's `app/` structure and pins TypeScript to the 5.9 line with `vue-tsc`. Target runtime and lockfile information are in `package.json`, `.nvmrc` and `package-lock.json`.

## First production release

See the [production readiness audit](docs/PRODUCTION_READINESS_AUDIT.md) and [verified project status](docs/PROJECT_STATUS.md) for current implementation and check results. The [MVP scope](docs/MVP_SCOPE.md), [roadmap](docs/ROADMAP.md), [backlog](docs/BACKLOG.md) and [release checklist](docs/PRODUCTION_CHECKLIST.md) cover the remaining work and owner decisions.
