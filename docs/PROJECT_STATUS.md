# Project status

**24 November 2026 · FE-02 navigation implemented · commercial launch blocked.** FE-01 was approved and Phase 01 authorization covered FE-02. Approved service-area wording and a monitored fallback channel are still due under BUS-01 and OPS-01. The next backlog dependency is BUS-01. After supplier and owner approval, BOOK-01 is the next implementation task. See the [backlog](BACKLOG.md).

## Phase 01 FE-02

Local baseline `feature/phase-01-frontend-completion` at `6fd7748`, with a clean starting working tree. Windows x64, Node `v24.22.2`, npm `11.19.1` and the existing npm lockfile.

- Home promoted an empty portfolio preview, and navigation advertised unfinished Portfolio, FAQ and Contacts pages. Home, header and footer now withhold those promotions. The direct URLs and portfolio implementation remain available. `/privacy` remains linked from the footer and checkout consent.
- Retained the existing desktop disclosure and mobile dialog. Escape dismisses a hover-open desktop panel without taking focus from outside it. Selecting a service closes the panel and restores its trigger focus. The mobile menu resets its disclosure on close, releases scroll lock and indicates the current service. An empty selection drawer closes when a visitor follows a link to the service already open.
- Service CTAs distinguish finding a service, adding it to the selection and opening the inquiry form. The booth entry point leads to customization when real gallery images are absent, and the old `#gallery` anchor links to the same useful destination. Photobook hero actions wrap inside their column at 1024 px, where they previously overlapped the cover controls. Checkout remains the submission step. Service-specific configurations, prices and persisted selection formats are preserved.
- The photozone hero handles zero or one concept, and the catalog omits filters with no results. An empty collection retains `#collection` and offers the existing individual-project flow. The closing CTA follows the anchor for the current ready or custom choice. No commercial catalog entries were edited.

| Check | Observed result |
|---|---|
| `npm run lint` and `npm run typecheck` | Exit 0. No remaining lint or TypeScript findings. |
| `npm run build` | Exit 0 with local filesystem access. Two restricted-shell attempts failed during Nitro dependency copy with `EPERM` on directories under `.output/server/node_modules` (`nostics` and `vue-bundle-renderer`). Local access resolved the failure with the existing font configuration. Non-blocking `PLUGIN_TIMINGS` warnings remain. |
| Chrome 158 and local production Nitro | At 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, 360 × 640 and 844 × 390, all four home links and applicable menu links opened their dedicated themed pages. Checked active links, horizontal overflow, desktop hover and keyboard interaction, mobile touch, Escape and focus return, breakpoint changes, same-route dismissal, scroll lock and reduced motion. |
| Routes and console | The rendered link walk found valid internal routes and anchors. `/order` redirected with HTTP 301 to `/checkout` and retained the selection. Portfolio, FAQ, Contacts and Privacy returned HTTP 200 with `noindex, follow`. Unknown service, unknown root and `/services` returned HTTP 404 and their home action worked. Normal routes had no console warnings, errors or hydration diagnostics. The unknown service still emitted the Phase 00 `NUXT_E1005` diagnostic. Nitro also logged unmatched-route warnings for the intentionally absent routes. |
| Selection and checkout | Added booth and photography through the public configuration buttons. Both positions persisted across navigation, the drawer, checkout, Back/Forward and refresh. Also added ready and custom photozones and a photobook, then reopened the saved book with its `?project=…#studio` link. No inquiry was submitted. |
| Photozone catalog | The current build showed four concepts. Two isolated local builds with zero and one concept exercised the empty-state route to a custom project and the single concept's filters and details dialog. Each added a position successfully. |

Changed files under `app/` are `config/navigation.ts`, `config/photozones.ts`, `pages/index.vue`, `pages/checkout.vue`, `components/layout/{AppHeader,MobileNavigation,NavDropdown}.vue`, `components/home/FinalCTASection.vue`, `components/about/FinalCtaSection.vue`, `components/selection/SelectionDrawer.vue`, `components/booth/{BoothBooking,BoothGallery,BoothHero}.vue`, `components/photography/{PhotographyCta,PhotographyFormats,PhotographyHero,PhotographyPricing,PhotographyStickyCta}.vue`, `components/photozones/{PhotozoneDetailsDialog,PhotozonesCatalog,PhotozonesCustom,PhotozonesFinalCta,PhotozonesFormats,PhotozonesHero}.vue`, and `components/photobook/{PhotobookHero,PhotobookPriceSummary}.vue`. Updated documentation is `BACKLOG.md`, `PROJECT_STATUS.md` and `PRODUCTION_CHECKLIST.md`.

**Remaining release evidence.** BUS-01 still owns the approved service-area copy for both cities, published images, equipment, packages and prices. OPS-01 still owns the approved monitored contact and its placement in Contacts, the footer and checkout recovery. BUS-02 still owns the privacy notice and matching consent. FAQ stays unpromoted pending a publication decision. WEB-01 should exclude the direct `noindex, follow` stub URLs from the eventual sitemap. The short-landscape studio overlap recorded in Phase 00 remains with BOOK-01, and the known invalid-service console diagnostic remains with the QA-01 public route checks. Browser evidence is local Chrome with emulated touch and screen sizes. Physical devices, assistive technology and the target host remain release-candidate checks.

## Phase 01 FE-01

Local baseline `feature/phase-01-frontend-completion` at `cdb9f66`, with a clean starting working tree. Windows x64, Node `v24.22.2` and npm `11.19.1`. The checks used the existing installed dependencies and lockfile.

Three About templates passed static string attributes to the numeric `ClipReveal.delay` prop. Numeric bindings preserve the hero, story and final CTA delays of 180, 200 and 180 ms respectively. The shared prop contract and reveal implementation are unchanged. Other `ClipReveal` call sites either omit the delay or already bind a numeric expression.

Nuxt uses filename-based component names because `pathPrefix` is disabled. The two `HeroSection.vue` files therefore collided in the auto-import registry despite Home's explicit import. About now uses `AboutHeroSection.vue` through the existing auto-import convention. Home retains its explicit import and its existing hero.

| Check | Observed result |
|---|---|
| `npm run lint` | Exit 0. No ESLint findings. |
| `npm run typecheck` | Exit 0. All three TS2322 diagnostics are resolved. The generated component declarations point to separate Home and About files. |
| `npm run build` | Exit 0. Nitro `node-server` output built with the existing font setup. No `NUXT_B3011` duplicate component warning. Vite/Rolldown emitted non-blocking `PLUGIN_TIMINGS` warnings. |
| Local production Nitro and Chrome 158 | Both routes returned HTTP 200 with distinct SSR headings. Direct loads and client navigation in both directions showed the correct heroes and the About image loaded. At 1440 × 900 and 390 × 844 CSS pixels, visual spot checks showed the expected layouts and neither settled layout overflowed horizontally. The browser reported no warnings, errors or hydration mismatches. |
| `ClipReveal` and reduced motion | SSR rendered all three reveals unmasked. After hydration, below-fold images revealed on scroll with the expected delays and a 900 ms duration. At 390 × 540 all three reveals started below the fold, exercising the About hero reveal as well. Reduced motion left all three unmasked. |

Changed source files are `app/components/about/AboutHeroSection.vue` (renamed from `HeroSection.vue`), `app/components/about/FinalCtaSection.vue`, `app/components/about/OurStorySection.vue` and `app/pages/about.vue`. Updated documentation is `docs/BACKLOG.md`, `docs/PROJECT_STATUS.md` and `docs/PRODUCTION_CHECKLIST.md`.

No new FE-01 defects were found. Browser results are from local Chrome with emulated mobile viewports. Actual mobile devices, other browsers and the target production host remain outside this verification. The Phase 00 audit remains the historical record, and release gates still require candidate evidence.

## Phase 00 audit close

Baseline `main`, commit `5e60bb0` (“feat: added about page”). The only pre-existing working-tree entry was untracked `docs/PROJECT_DEEP_AUDIT.md`. No production release, real inquiry or external group test was performed.

| Area | Status at audit close |
|---|---|
| Discovery and public pages | Home, About and four explicit service routes render. Most service imagery remains illustrative or empty. Contacts, FAQ, Privacy and Portfolio are actual stub pages. Portfolio is discoverable via home and footer. |
| Booth, photography and photozones | Configurators add and edit shared positions. Booth/photography/custom zones support individual quotes. Ready zone prices and available catalog await owner approval. |
| Photobooks | Presets, dimensions, pages, cover, materials, colour, finishing, quantity, demo estimates, preview, local projects, editor and cart integration implemented. Printer approval and complete operator-readable handoff outstanding. |
| Checkout and delivery | Four-service inquiry, validation, draft restore and receipt verified locally with a test transport. Private Nitro credentials and Telegram call exist. Server consent, authoritative pricing, anti-spam, idempotency edge cases and truthful failure handling remain open. |
| Engineering | ESLint green. Three TypeScript errors. Production bundle builds with Google Fonts access. No tracked automated test or CI job found. |
| Production operations | Domain, target host, TLS, bot/group access, fallback contact, external register, operator coverage and privacy approval unverified. |

## Verification record

Windows x64, Node `v24.22.2` (matches `.nvmrc`), npm `11.19.1`. Existing installed dependencies and npm lockfile used. The checks ran individually to expose all results.

| Command | Observed result |
|---|---|
| `git status --short --branch` | Started on `main...origin/main` with only `?? docs/PROJECT_DEEP_AUDIT.md`. This describes the local tracking reference. |
| `npm ls --depth=0` | Installed direct versions match the top-level requirements, including Nuxt 4.6.4, Vue 3.5.45, Vue Router 5.4.0, TypeScript 5.9.3 and vue-tsc 3.3.14. |
| `npm run lint` | Exit 0. No ESLint findings. |
| `npm run typecheck` | Exit 1. TS2322, `Type 'string' is not assignable to type 'number'`, at `app/components/about/FinalCtaSection.vue(22,23)`, `app/components/about/HeroSection.vue(43,23)` and `app/components/about/OurStorySection.vue(28,23)`. Each passes a string literal to the numeric `ClipReveal.delay` prop. Also warned `NUXT_B3011` for home and About components named HeroSection. |
| `npm run build` | First run exited 1 while bundling `app/assets/css/main.css`. The Nuxt Fonts Google provider retried `https://fonts.google.com/metadata/fonts`, then failed with `getaddrinfo ENOTFOUND fonts.google.com`. Same command with network access exited 0 using Nitro 2.13.6, preset `node-server`. The duplicate HeroSection warning persisted. Output 26 MB (9.97 MB gzip). Sharp binaries target win32-x64. |
| `npm audit --omit=dev --audit-level=high --fetch-retries=0` | Exit 0 at the high threshold. Reported 12 moderate findings including dependent packages, rooted in glob/minimatch advisories GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Audit proposed a forced Nuxt version change for part of the tree. No dependency or lockfile changes applied. |
| Existing test commands | No test script or tracked test files found. Local checks below are audit observations, independent of a committed regression suite. |

## Local production-bundle smoke checks

The freshly built `.output/server/index.mjs` served loopback only. Disposable credentials pointed `NUXT_TELEGRAM_API_BASE` at a local HTTP stub. The restricted shell initially denied loopback with `EACCES`. The checks below ran with local access. All customer data in the checks were synthetic.

- HTTP 200 on home, all four service pages, About, Contacts, FAQ, Checkout, Privacy and Portfolio. A 200 on a stub confirms routing only. An unknown service, an unknown root path, `/services` and `/sitemap.xml` returned 404. `/order` returned 301 with Location `/checkout`. `/robots.txt` returned 200.
- Headless Chrome loaded those eleven public pages plus the invalid service at 390 × 844 and 1440 × 900 CSS pixels. Each had an H1 and zero document-level horizontal overflow. The sampled completed images with a current source had no load failures. Intentional placeholders, below-fold lazy resources and clipping by fixed elements are outside that measurement. Distinct H1s confirmed the intended heroes on Home and About.
- At a scroll position inside the studio, the 390 × 844 window left about 351 CSS pixels between the bottom of the pinned preview and the top of the order bar. At 844 × 390, the preview occupied y=72–504 and the fixed bar started at y=319. The preview and bar overlapped with no vertical gap for the settings beneath them. Include this observed landscape failure in BOOK-01.
- The initial photobook SSR response was 274,814 bytes of uncompressed HTML, compared with 70,778 on Home. These are HTML sizes on localhost, not load-time or Core Web Vitals measurements.
- Two local submissions with the same key and content returned 200 with one upstream send and the same number. A simulated upstream 503 yielded 502 `delivery-failed`. Retrying after restoring the stub yielded 200. These observations apply to a single running process and small messages.
- In the browser, the booth, photography, custom photozone and unfinished photobook positions arrived together at checkout. Submitting an empty contact form flagged invalid controls. A valid synthetic request against the refusing stub displayed a delivery error. Reload restored the name and mixed selection with consent unchecked. After renewed consent and stub recovery, the browser displayed a numbered receipt and removed both cart and request-draft storage entries.
- The invalid service rendered the expected 404 but emitted `NUXT_E1005` in the client console (twice in the route-specific rerun). The diagnostic means an error was caught during app initialization. Clicking the error page’s home button returned to the correct home H1. The underlying cause of the diagnostic remains unverified. No diagnosis is inferred from the code alone.

**Outstanding evidence.** Actual mobile browsers and assistive technology, physical keyboard flow, real Telegram acceptance, deployed HTTPS and proxy behavior, production monitoring and signed business/legal decisions. No real bot credentials or customer records were needed for Phase 00.

At Phase 00 close, FE-01 was the first implementation task awaiting approval. Catalog, fallback contact and privacy decisions are tracked in the [backlog](BACKLOG.md).
