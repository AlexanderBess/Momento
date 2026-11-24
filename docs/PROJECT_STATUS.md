# Project status

**24 November 2026 · Phase 00 complete · commercial launch blocked.** Baseline `main`, commit `5e60bb0` (“feat: added about page”). The only pre-existing working-tree entry was untracked `docs/PROJECT_DEEP_AUDIT.md`. Phase 01 is pending approval. No production release, real inquiry or external group test was performed.

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

**Next implementation task.** After Phase 01 approval, take FE-01. Owners can begin the catalog, fallback contact and privacy decisions identified in the [backlog](BACKLOG.md).
