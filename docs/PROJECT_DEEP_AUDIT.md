# MOMENTO — Deep Project Audit

**Date:** 22.11.2026  
**Scope:** Full source inspection (read-only). All `.vue`, `.ts`, config files under `app/`, `server/`, `shared/` were read.  
**Status convention:** COMPLETE / PARTIAL / PLACEHOLDER / UNKNOWN (see definitions below).

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| **COMPLETE** | Implemented and functional based on inspected source code. |
| **PARTIAL** | Partially implemented — works but has gaps, missing edges, or known TODOs. |
| **PLACEHOLDER** | Placeholder or demo implementation; not production-ready as-is. |
| **UNKNOWN** | Insufficient evidence to determine status. |

---

## 1. Component Inventory

### Shared UI (`app/components/ui/`)

| Component | Responsibility | Props / Events | Deps | Status | Notes |
|-----------|---------------|----------------|------|--------|-------|
| `BaseButton.vue` | Primary/secondary/ghost button; renders `NuxtLink` when `to` set, else `<button>` | `to`, `variant`, `size`, `type`, `disabled`, `block`, icon slot | `NuxtLink`, `@lucide/vue` | COMPLETE | Micro-interactions (hover lift, press scale); focus ring via CSS. |
| `BaseDialog.vue` | Native `<dialog>` modal with focus trap, Esc, backdrop click, scroll lock | `title`, `hideTitle`, `size`, `guarded`, `open` (model), `close-request` | `useScrollLock`, `@lucide/vue` | COMPLETE | Top layer via native dialog; guarded mode emits instead of closing. |
| `PhotoFrame.vue` | Image with reserved aspect-ratio; placeholder when `src: null` | `image`, `ratio`, `sizes`, `priority`, `zoomOnHover`, `rounded`, `tone` | `@nuxt/image`, types | COMPLETE | Container-query labels; explicitly marked "Демо" placeholders; no fake work. |
| `ClipReveal.vue` | Clip-path bottom-to-top reveal on scroll | `delay` | `useMotionLevel` | COMPLETE | SSR-safe; hidden only after JS mount; respects reduced motion. |
| `SectionHeading.vue` | Eyebrow + heading (h1/h2/h3) + lead text | `title`, `eyebrow`, `lead`, `as`, `align`, `headingId` | None | COMPLETE | Correct document outline via `as` prop. |
| `PageStub.vue` | Honest placeholder for unbuilt routes | `title`, `description`, `eyebrow` | `SectionHeading`, `BaseButton` | COMPLETE | `robots: 'noindex, follow'`; no fake forms/prices. |
| `ToastHost.vue` | Toast notifications in `role="status" aria-live="polite"` region | None (reads `useToast`) | `@lucide/vue`, `NuxtLink` | COMPLETE | Pause on hover/focus; auto-dismiss 6s; action link/button. |
| `ConfirmHost.vue` | Confirmation dialog rendered once in layout | None (reads `useConfirm`) | `BaseDialog`, `useConfirm` | COMPLETE | Confirm/cancel/dismiss answers; danger tone option. |
| `FaqAccordion.vue` | FAQ accordion | — | — | UNKNOWN | File exists; contents not read. |

### Layout (`app/components/layout/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `AppHeader.vue` | Sticky header; sentinel-driven scrolled state; nav; cart badge; CTA; mobile toggle | COMPLETE | `useInView` sentinel (no scroll listener); `useCart` count; `useSelection` drawer. |
| `AppFooter.vue` | Brand info, conditional contacts/socials, nav groups, copyright + legal | COMPLETE | Empty `brand.contacts`/`legal` fields not rendered. |
| `AppLogo.vue` | Logo mark | COMPLETE | — |
| `MobileNavigation.vue` | Native `<dialog>` mobile menu; accordion subsections; `grid-template-rows` height animation | COMPLETE | Auto-closes on lg breakpoint crossing; scroll lock; Esc to close. |
| `NavDropdown.vue` | Desktop disclosure dropdown; hover+click; keyboard nav; debounced close | COMPLETE | Arrow keys/Home/End; focus restore; outside-click close. |
| `PageLoader.vue` | Throttled hairline loading bar (250ms throttle) | COMPLETE | `useLoadingIndicator`; `view-transition-name: page-loader`; destination accent colour. |

### Homepage sections (`app/components/home/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `HeroSection.vue` | Home hero: copy, CTA buttons, photo + detail shot, decorative glow | COMPLETE | All `src: null` → placeholders; `useInView` pauses glow off-screen. |
| `ServicesSection.vue` | Horizontal snap carousel of 4 service cards | COMPLETE | `v-reveal` staggered; `no-scrollbar` utility; 1-col mobile → 4-col desktop. |
| `AIPhotoBoothSection.vue` | AI photo booth promo with stacked print collage | COMPLETE | All images `src: null`; glow loops paused off-screen. |
| `PortfolioSection.vue` | Positional bento grid of portfolio previews | COMPLETE | `PhotoFrame` ratio="fill"; zoom-on-hover; category labels. |
| `BenefitsSection.vue` | 4 benefit cards with icons | COMPLETE | Lucide icons mapped by `BenefitIcon` type. |
| `FinalCTASection.vue` | Final CTA block | COMPLETE | Uses `primaryCta` from navigation config. |
| `ServiceCard.vue` | Service card (used in carousel) | UNKNOWN | File exists; contents not read. |

### Booth (`app/components/booth/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `BoothHero.vue` | Dark "stage" hero with AI portrait collage; pointer parallax; entrance animations | COMPLETE | `useInView` + `useMotionLevel`; all images `src: null`; LCP-safe heading rise only. |
| `BoothBooking.vue` | Event type + design wishes form; "Отправить заявку" / "Добавить к общей заявке" | COMPLETE | Uses `useBoothOrder()`; no prices; honest "обсуждается". |
| `BoothCustomization.vue` | WAI-ARIA tabs for customization options; image crossfade | COMPLETE | Keyboard nav (←/→/Home/End); `ClipReveal`; `PhotoFrame`. |
| `BoothEventTypes.vue` | Event type cards (wedding/birthday/private/corporate/brand); clickable cards | COMPLETE | `useBoothEvent()`; ratio changes per breakpoint via CSS vars. |
| `BoothBusiness.vue` | Corporate section; parallax media; "Обсудить корпоративное мероприятие" sets event type | COMPLETE | `useParallax`; `ClipReveal`. |
| `BoothEquipment.vue` | Equipment specs from manufacturer; hotspots on equipment image | COMPLETE | `boothKit` all `null` (not rendered); source URL to dzentech.ru. |
| `BoothTransformation.vue` | Before/After slider with example switcher | COMPLETE | `BeforeAfterSlider`; all images `src: null`; "демонстрационные примеры" label. |
| `BoothHowItWorks.vue` | Scroll-driven timeline with connector fill animation | COMPLETE | `useInView` gate; `requestAnimationFrame` throttled scroll; reduced-motion safe. |
| `BoothGallery.vue` | Filterable AI gallery with "Показать ещё" pagination | COMPLETE | `GALLERY_PAGE_SIZE=6`; CSS columns masonry; crossfade on filter change. |
| `BoothFaq.vue` | FAQ accordion with `boothFaq` config | COMPLETE | `FaqAccordion`; sticky heading on lg. |
| `EquipmentHotspots.vue` | Click/tap hotspots on equipment image with popup panels | COMPLETE | `aria-expanded`; Esc/outside-click close; hover preview on fine pointers. |
| `BeforeAfterSlider.vue` | Pointer + keyboard accessible before/after comparison slider | COMPLETE | `role="slider"`; pointer capture; demo hint animation; `touch-action: pan-y`. |

### Photography (`app/components/photography/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `PhotographyHero.vue` | Editorial hero: tall photo + serif headline; vertical index; bottom category list | COMPLETE | `useParallax` only if `src` set; LCP-safe; all `src: null` → `PhotographyFrame` placeholder. |
| `PhotographyFormats.vue` | Main formats (2 large editorial spreads) + more formats (compact text list) | COMPLETE | `usePhotographyOrder().selectDirection`; all `src: null`. |
| `PhotographyPricing.vue` | Packages (3), add-ons, summary, "Отправить заявку" / "Добавить к общей заявке" | COMPLETE | `usePhotographyOrder()`; `null` prices → "По запросу"; individual offer. |
| `PhotographyExtras.vue` | Cross-sell of other MOMENTO services | COMPLETE | Falls back to icon tile when service image `src: null`. |
| `PhotographyProcess.vue` | 5-step process with line-draw animation | COMPLETE | `useInView` gate; segment-by-segment line draw. |
| `PhotographerIntroduction.vue` | Photographer photo + bio | COMPLETE | `name: null` → name line not rendered; all `src: null`. |
| `PhotographyCta.vue` | Closing CTA block | COMPLETE | Links to pricing. |
| `PhotographyStickyCta.vue` | Floating mobile CTA; appears/disappears based on hero/pricing/CTA visibility | COMPLETE | 3 IntersectionObservers; `lg:hidden`; never covers footer. |
| `PhotographyFrame.vue` | Photography page frame with viewfinder placeholder when `src: null` | COMPLETE | `tone` variants; crop marks; explicit "Фото будет добавлено" label. |

### Photozones (`app/components/photozones/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `PhotozonesHero.vue` | Sage-tinted hero; visual + overlapping secondary visual; bottom index | COMPLETE | `photozoneConcepts[1]!.gallery[0]!` — **potential crash** if concepts array has < 2 items or empty gallery. |
| `PhotozonesFormats.vue` | Two directions: ready collection vs individual project | COMPLETE | `ClipReveal`; `PhotozoneVisual`. |
| `PhotozonesCatalog.vue` | Filterable concept cards; opens `PhotozoneDetailsDialog` | COMPLETE | `usePhotozoneOrder()`; `isInCart` badge; demo price label. |
| `PhotozonesCustom.vue` | Individual project: directions (florals/structures/personalisation); add/submit actions | COMPLETE | `snap-x` carousel on mobile; grid on tablet+. |
| `PhotozonesService.vue` | 4 service steps (prepare/delivery/install/dismantle); delivery cost note | COMPLETE | Icons mapped; "стоимость доставки зависит от расположения". |
| `PhotozonesProcess.vue` | 4 order steps + "не означает автоматического бронирования" note | COMPLETE | — |
| `PhotozonesFinalCta.vue` | Closing block; chooser dialog when nothing selected | COMPLETE | `usePhotozoneOrder()` + `useSelection()`; handles add/submit flows. |
| `PhotozoneDetailsDialog.vue` | Concept details in `BaseDialog` (lg): gallery, options, price, add/submit | COMPLETE | `photozonePrice` from `lib/selection`; options remembered per concept while on page. |
| `PhotozoneVisual.vue` | Image slot; schematic SVG sketch when `src: null`; deterministic florals/balloons | COMPLETE | Explicitly labelled "Концепция · фото будет добавлено"; container-query labels. |

### Photobook (`app/components/photobook/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `PhotobookHero.vue` | Product still life: open book + closed volume + prints; cover colour switcher | COMPLETE | Real photos switch from rendered book; `failed` set; all 4 closed colours or none. |
| `PhotobookCollections.vue` | 4 ready presets; "Использовать шаблон" applies preset via `usePhotobookStudio` | COMPLETE | Focus management for keyboard/SR users. |
| `PhotobookConfigurator.vue` | Book Studio: settings (left) + preview (right, sticky); mobile order bar | COMPLETE | `usePhotobookStudio` + `useBookStudioSession`; 5 collapsible groups via `StudioGroup`. |
| `PhotobookMaterials.vue` | Editorial materials spread; fabric/leatherette/paper visualisations | COMPLETE | Labelled "Визуализация"; no durability claims. |
| `PhotobookCover.vue` | CSS 3D closed book: boards, spine, page block, title finishes | COMPLETE | Pointer tilt; container-query sizing; `pure CSS` spine thickness from page count. |
| `PhotobookCoverSelector.vue` | Cover type, colour, title, title color, title position, photo replacement | COMPLETE | `usePhotobookStudio().update` + `coverPose` reset. |
| `PhotobookFormatSelector.vue` | Format chips with mini silhouette | COMPLETE | — |
| `PhotobookPageSelector.vue` | Page count stepper + chips | COMPLETE | `aria-live="polite"` on current value. |
| `PhotobookMaterialSelector.vue` | Paper type selection | COMPLETE | `focusView('spread')` after change. |
| `PhotobookExtrasSelector.vue` | Endpaper, spine color, extras (embossing, spineText) with availability checks | COMPLETE | `unavailableReason`; disabled switches. |
| `PhotobookLayoutSelector.vue` | Per-spread layout, photo slots, caption editing | COMPLETE | Layout diagram from `spreadLayouts` slots; `pickerTarget` for image replacement. |
| `PhotobookPreview.vue` | Cover/spread/thumbnails view switch; page turn arrows; touch swipe | COMPLETE | `view` transition; `aria-roledescription`; keyboard arrows. |
| `PhotobookPriceSummary.vue` | Price breakdown + quantity + "Добавить в заказ" / "Оформить заказ" | COMPLETE | `usePhotobookPrice()`; demo estimate label; `layoutComplete` checkbox. |
| `PhotobookProcess.vue` | 4 steps from studio to production | COMPLETE | Hardcoded steps (not from config). |
| `PhotobookFinalCta.vue` | Closing block with rendered book stack | COMPLETE | `createConfig` rendered configs; no real photos. |
| `PhotobookProjectBar.vue` | Project name, save status, "Мои книги" dialog, "Новая книга" | COMPLETE | `usePhotobookProject()`; independent of selection. |
| `PhotobookImage.vue` | Library image; real photo or `DemoArtwork` fallback; broken → illustration | COMPLETE | `findImage` lookup; `failed` state. |
| `PhotobookImagePicker.vue` | Gallery picker for slot/cover image replacement | COMPLETE | Category filter; `BaseDialog` (lg). |
| `PhotobookSpread.vue` | Open book with page-turn leaf animation | COMPLETE | Pure CSS 3D; `flip` state; `useMotionLevel` guard. |
| `PhotobookThumbnails.vue` | All spreads as miniatures (strip/grid); scrolls active into view | COMPLETE | — |
| `SpreadArtwork.vue` | Spread content: photos in slots, caption, paper surface treatments | COMPLETE | `interactive` mode adds "Заменить фото" buttons; `:deep(.pb-image)` filters. |
| `SpreadHalf.vue` | One page half of a spread; endpaper handling | COMPLETE | Clipped to 50% width for page-turn leaf. |
| `StudioGroup.vue` | Collapsible settings group (disclosure pattern) | COMPLETE | `0fr → 1fr` height animation; `inert` when closed. |
| `DemoArtwork.vue` | Procedural SVG demo illustration (14 scenes) | COMPLETE | Seeded PRNG; deterministic SSR/client match; `slice` cropping. |
| `MaterialSurface.vue` | Material texture fill (SVG noise, no image requests) | COMPLETE | `linen`/`grain`/`print`/`matte`/`gloss`/`texture`/`plain`. |
| `PhotobookConflictDialog.vue` | Conflict resolution: load latest / reapply mine | COMPLETE | `BaseDialog` guarded; shows conflicting field labels. |

### Selection (`app/components/selection/`)

| Component | Responsibility | Status | Notes |
|-----------|---------------|--------|-------|
| `SelectionDrawer.vue` | "Моя подборка" drawer (native `<dialog>`); service links when empty; total + checkout | COMPLETE | `useScrollLock`; opening does not extend 30-day retention; closes on route change. |
| `SelectionList.vue` | Positions list with edit/remove; notice live region | COMPLETE | Highlights just-saved item for 6s; `aria-live="polite"` SR-only. |
| `SelectionItem.vue` | One position card: service, title, price, details, status badge, edit/remove | COMPLETE | `priceText` from `lib/selection`; demo price label. |
| `editors/BoothEditor.vue` | Booth position editor: event type + design | COMPLETE | `defineModel<BoothConfig>`; same options as page. |
| `editors/PhotographyEditor.vue` | Photography position editor: direction, package, extras | COMPLETE | `defineModel<PhotographyConfig>`; same options as page. |
| `editors/PhotozoneEditor.vue` | Photozone position editor: options or custom idea notes | COMPLETE | `defineModel<PhotozoneConfig>`; live price calc. |
| `editors/PhotobookEditor.vue` | Photobook simplified editor: format, pages, cover, color, title, paper, quantity | COMPLETE | `defineModel<ProjectState>`; `normalize` after every change. |

---

## 2. Page-by-Page Analysis

### Homepage (`/`) — `app/pages/index.vue`

**Structure:** HeroSection → ServicesSection → AIPhotoBoothSection → PortfolioSection → BenefitsSection → FinalCTASection

**Components used:** All 6 home sections (see inventory above).

**Functionality:** Full editorial landing page with all service promos; scroll reveals via `v-reveal`; all images are `src: null` placeholders.

**Status:** COMPLETE (as a landing page shell). Missing: all photo/video content missing (see docs/IMAGES.md). Portfolio section has no real work yet.

### AI Photo Booth (`/services/booth`) — `app/pages/services/booth.vue`

**Structure:** BoothHero → BoothTransformation → BoothEventTypes → BoothHowItWorks → BoothGallery → BoothBusiness → BoothEquipment → BoothCustomization → BoothFaq → BoothBooking

**Functionality:** Full service page with theme `photobooth` (warm sand palette); `definePageMeta({ service: 'photobooth' })`; booking block syncs with `useBoothOrder()` → shared selection.

**Status:** COMPLETE. Missing: all images `src: null` (4 hero portraits, 3 before/after pairs, 5 event cards, 10 gallery items, 4 customization options, equipment photo, business photo). `boothKit` all `null`. No actual AI results — explicitly demo.

### Photography (`/services/photography`) — `app/pages/services/photography.vue`

**Structure:** PhotographyHero → PhotographyFormats → PhotographyProcess → PhotographyPricing → PhotographyExtras → PhotographerIntroduction → PhotographyFaq → PhotographyCta → PhotographyStickyCta

**Functionality:** Theme `photography` (dusty rose palette); format selection → direction stored in `usePhotographyOrder()` → shared selection; package selection + add-ons → pricing summary; sticky mobile CTA auto-hides when pricing/final CTA visible.

**Status:** COMPLETE. Missing: all images `src: null` (hero, 2 main formats, photographer photo). All prices `null` → "По запросу". Photographer `name: null` → not rendered.

### Photozones (`/services/photozones`) — `app/pages/services/photozones.vue`

**Structure:** PhotozonesHero → PhotozonesFormats → PhotozonesCatalog → PhotozonesCustom → PhotozonesService → PhotozonesProcess → PhotozonesFinalCta → PhotozoneDetailsDialog

**Functionality:** Theme `photozones` (sage green palette); catalogue with filter chips; concepts open in details dialog; options chosen per concept remembered while on page; individual project with idea notes; final CTA with chooser dialog when nothing selected.

**Status:** COMPLETE. Missing: all images `src: null` → schematic SVG sketches (explicitly labelled). Prices are `photozonePricing.isDemo: true` demo values. Concept IDs and option IDs go into orders — must not be renamed after launch.

**Risk:** `PhotozonesHero.vue` line 10: `photozoneConcepts[1]!.gallery[0]!` — non-null assertion. If `photozoneConcepts` has fewer than 2 entries, or concept[1] has empty gallery, this crashes at runtime. Currently safe (4 concepts, each with ≥2 gallery items) but fragile.

### Photobooks (`/services/photobooks`) — `app/pages/services/photobooks.vue`

**Structure:** PhotobookHero → PhotobookCollections → PhotobookConfigurator → PhotobookMaterials → PhotobookProcess → PhotobookFinalCta

**Functionality:** Theme `photobooks` (dusty blue palette); full Book Studio: format, pages, cover, paper, extras, spreads, layout, photos; autosave to localStorage with versioning and conflict resolution; "Добавить в заказ" / "Оформить заказ" → shared selection; "Мои книги" project list independent of selection.

**Status:** COMPLETE (studio is fully functional as a client-side tool). Missing: all library images `src: null` → procedural `DemoArtwork` illustrations. Pricing is `mode: 'estimate'` with `isDemo: true` → demo figures, not real prices. No photo upload — only demo library images can be used.

### Checkout (`/checkout`) — `app/pages/checkout.vue`

**Structure:** Single form: 1) Composition (SelectionList) → 2) About the event (collapsed) → 3) Contacts → Summary + send (sticky aside)

**Functionality:** Single request form for all services; reads cart via `useCart()`; form draft via `useRequestDraft()`; client + server validation via shared `#shared/lead` (`validateLead`); idempotency key from content hash; POST to `/api/leads` → server sanitizes → Telegram Bot API; success shows server-issued request number (`MO-YYMMDD-XXXX`); clears cart+draft+consent; failure keeps everything; honeypot anti-bot field; consent never stored.

**Status:** COMPLETE (form logic fully implemented). Missing: Telegram bot token/chat ID not configured → endpoint returns 503 `not-configured`; form honestly says sending is not connected. No real email/phone/social contact data in brand config.

### About (`/about`) — `app/pages/about.vue`

**Content:** `<PageStub title="О нас" />`

**Status:** PLACEHOLDER. Missing: no content. Honest stub with `robots: 'noindex, follow'`.

### Contacts (`/contacts`) — `app/pages/contacts.vue`

**Content:** `<PageStub title="Контакты" />`

**Status:** PLACEHOLDER. Missing: no content. Brand contacts are all `null`.

### FAQ (`/faq`) — `app/pages/faq.vue`

**Content:** `<PageStub title="Частые вопросы" />`

**Status:** PLACEHOLDER. Missing: no content. FAQ exists per-page (booth, photography) but no site-wide FAQ page content.

### Portfolio (`/portfolio`) — `app/pages/portfolio.vue`

**Content:** `<PageStub title="Портфолио" description="Здесь появятся работы с наших мероприятий." />`

**Status:** PLACEHOLDER. Missing: no portfolio items. Homepage PortfolioSection uses `portfolioPreview` from config.

### Privacy (`/privacy`) — `app/pages/privacy.vue`

**Content:** `<PageStub title="Политика обработки персональных данных" description="Документ будет опубликован до запуска приёма заявок." />`

**Status:** PLACEHOLDER. Missing: no privacy policy text. Checkout consent links to this page.

### Shared components consistency

All pages use `SectionHeading`, `BaseButton`, `PhotoFrame`/`PhotographyFrame`/`PhotozoneVisual`/`PhotobookCover`/`PhotobookSpread` consistently. Service pages use `definePageMeta({ service })` for theming. The dynamic `/services/[slug].vue` fallback renders `PageStub` with "страница в разработке" — honest placeholder.

---

## 3. Business Logic Analysis

### Data flow: service configurator → shared selection → checkout request

```
Service Page (e.g. /services/booth)
    │
    ├─ useBoothOrder() / usePhotographyOrder() / usePhotozoneOrder()
    │     (page-level state: event type, package, options, idea notes)
    │     └─ builds CartItemInput via lib/selection.ts builders
    │           (boothItem, photographyItem, photozoneReadyItem, photobookItem)
    │
    ├─ useSelection().addToSelection(item) or submitWith(item)
    │     └─ useCart().add(item) → localStorage (momento:cart:v2, 30-day TTL)
    │           ├─ single-position services (booth, photography): replace-confirm
    │           ├─ multi-position (photozones, photobooks): keyed by conceptId/projectId
    │
    └─ /checkout
          ├─ SelectionList renders cart items
          ├─ RequestDraft (event details + contacts) in localStorage (momento:request-draft:v1)
          └─ submitLead() → POST /api/leads → server validates → Telegram Bot API
```

### Composables analysis

| Composable | Responsibility | Status | Key observations |
|------------|---------------|--------|------------------|
| `useCart` | Shared selection; localStorage persistence; 30-day TTL; cross-tab sync | COMPLETE | Sanitizes stale items; dedupes by key+id; single-position replace logic |
| `useSelection` | UI around cart: drawer, editor, add/submit with replace-confirm | COMPLETE | `put()` returns `needs-replace` → `useConfirm().ask()` before replacing |
| `useRequestDraft` | Checkout form draft (event + contacts); autosave 400ms debounce; idempotency key | COMPLETE | Consent never stored; 30-day TTL; key reuse on network failure |
| `useBoothOrder` / `useBoothEvent` | Booth page state → `boothItem()` builder | COMPLETE | `syncFromSelection()` only if nothing chosen yet |
| `usePhotographyOrder` | Photography page state → `photographyItem()` builder | COMPLETE | `touched` flag prevents saved config overriding new choices |
| `usePhotozoneOrder` | Photozone page state; drafts per concept; `readyItemOf` | COMPLETE | `customItem()` preserves saved notes; `isUpToDate` for dialog state |
| `usePhotobookStudio` | Photobook config state; all changes through `normalize()` | COMPLETE | Preset application doesn't reset quantity |
| `usePhotobookProject` | Project storage; autosave; versioning; conflict resolution; addToSelection | COMPLETE | 700ms debounce; `storage` events + CustomEvent for cross-tab |
| `useBookStudioSession` | Session wiring: load from `?project=` or last used; save on pagehide | COMPLETE | — |
| `usePhotobookPrice` | `calculatePrice()` pure function | COMPLETE | Demo pricing; designed to be swapped for API |
| `useConfirm` | Site-wide confirmation dialog (single pending) | COMPLETE | New question dismisses unanswered one; Promise-based |
| `useToast` | Site-wide toasts (one at a time; newer replaces older) | COMPLETE | 6s duration; pause on hover/focus |
| `useInView` | IntersectionObserver reactive flag | COMPLETE | SSR-safe; `once` option |
| `useMotionLevel` | full/reduced based on prefers-reduced-motion + low-end device | COMPLETE | `hardwareConcurrency <= 4 || deviceMemory <= 4` |
| `useParallax` | Vertical parallax CSS var; gated by InView + motion level | COMPLETE | `requestAnimationFrame` batched |
| `useScrollLock` | Counted scroll lock for modals/drawer | COMPLETE | Released on unmount |

### Checkout submission flow

1. User fills event details + contacts on `/checkout`
2. `submit()` validates via `validateLead()` (shared with server)
3. Idempotency key = hash of sorted JSON payload
4. `submitLead()` POSTs to `/api/leads` with 30s timeout
5. Server (`leads.post.ts`):
   - Sanitizes input (`sanitizeLead`) — drops unknown fields, enforces limits
   - Validates again (`validateLead`) — never trusts client
   - Honeypot filled → fake success (bot gets no signal)
   - Idempotency check (in-memory Map, 24h TTL)
   - If not configured → 503 `not-configured`
   - Sends to Telegram Bot API (split into <3800 char parts)
   - Returns `{ ok, requestNumber }` or `{ ok, reason, fields? }`
6. Client: success → clears cart + draft + consent; shows request number
7. Client: failure → keeps everything; shows reason; retry with same idempotency key

### Potential inconsistencies and fragile dependencies

| # | Risk | Location | Severity | Mitigation |
|---|------|----------|----------|------------|
| 1 | `photozoneConcepts[1]!.gallery[0]!` non-null assertion crashes if concepts < 2 or empty gallery | `PhotozonesHero.vue:10` | Medium | Add fallback or defensive check |
| 2 | Server idempotency Map is in-memory; lost on restart → duplicate delivery possible | `leads.post.ts` | Low | Note in docs; acceptable for single-instance |
| 3 | `normalize()` accesses `library.images[0]!` — crashes if library empty | `lib/photobook.ts:207` | Low | Libraries are hardcoded non-empty |
| 4 | `createConfig` `nextSpreadSeq` parses `id.slice(2)` — breaks if ID format changes | `lib/photobook.ts:86` | Low | Contained; IDs stable |
| 5 | All photos missing → site looks like a template; trust impact | All service pages | High | Add real photos before launch (docs/IMAGES.md) |
| 6 | Demo prices labelled as such, but users may confuse with real | `pricing.ts`, `photozones.ts` | Medium | Keep `isDemo` labels prominent; switch to `on-request` before launch |
| 7 | No CSRF/rate limiting on public POST endpoint | `leads.post.ts` | Low | Add rate limiting if spam becomes an issue |
| 8 | `validateLead` server hardcodes `consent: true` | `leads.post.ts:51` | Low | By design (client enforces UI), but document |


---

## 4. Configuration and Content Audit

### `app/config/brand.ts`

**Status:** PARTIAL

- `name: 'MOMENTO'`, `tagline: 'Сохраняем главное'`, description, region set
- `contacts`: all `null` (phone, email, city, workingHours) → not rendered in footer
- `socials: []` → no social links rendered
- `legal`: all `null` → no legal line in footer
- **Needs before launch:** real contact data, social links, legal entity details

### `app/config/navigation.ts`

**Status:** COMPLETE

- Main nav: Услуги (dropdown with 4 services), О нас, FAQ
- No `/services` index page (intentional)
- `primaryCta`: "Оставить заявку" → `/checkout`
- `cartLink`: "Моя подборка" → `/checkout`
- Footer nav groups: Услуги, Компания
- Legal: privacy policy link

### `app/config/services.ts`

**Status:** COMPLETE (as data), PLACEHOLDER (as content)

- 4 services: booth (featured), photography, photozones, photobooks
- All `image.src: null` → placeholders
- **Needs:** real service photos in `/public/images/services/`

### `app/config/booth.ts`

**Status:** COMPLETE (structure), PLACEHOLDER (assets)

- All images `src: null` (4 hero portraits, 3 before/after, 5 event cards, 10 gallery, 4 customization, business, equipment)
- `boothKit`: camera/monitor/printer all `null` (not rendered — honest)
- Equipment specs from dzentech.ru (manufacturer data)
- FAQ: 8 neutral questions
- Gallery category labels are "Demo categories — visual directions, not a confirmed list"

### `app/config/photography.ts`

**Status:** COMPLETE (structure), PLACEHOLDER (assets/prices)

- All images `src: null` (hero, 2 formats, photographer)
- All package prices `null` → "По запросу"
- All extras prices `null` → "По запросу"
- `photographer.name: null` → not rendered
- FAQ: 6 questions

### `app/config/photozones.ts`

**Status:** COMPLETE (structure), PLACEHOLDER (assets/prices)

- `photozonePricing.isDemo: true` — all prices are demo values
- 4 concepts with schematic SVG sketches (no real photos)
- 4 options with mixed `null`/real prices
- Concept IDs (`sage-arch`, `moon-circle`, `soft-cloud`, `gallery-panels`) and option IDs go into orders — **must not rename after launch**

### `app/config/photobook/`

- **covers.ts:** Demo range warning; 3 cover types (fabric, leatherette, photo); 6 fabric + 4 leatherette + 2 photo colors
- **formats.ts:** 3 formats (square 30×30, landscape 30×20, portrait 20×30); page counts [20,30,40,50,60]; Preliminary values warning
- **materials.ts:** 3 paper types; 4 endpaper colors; 2 extras (embossing, spineText); Preliminary list warning
- **pricing.ts:** `mode: 'estimate'`, `isDemo: true` — **demo figures, not real prices**. Warning to keep `mode: 'on-request'` until real prices agreed.
- **presets.ts:** 4 presets (weddingStory, familyMoments, travelJournal, littleMoments); all `coverImageId` reference library images that are `src: null`; DEFAULT_PRESET = 'weddingStory'
- **layouts.ts:** 6 layouts (full, split, editorial, collage, minimal, asymmetric); CAPTION_MAX_LENGTH = 120
- **hero.ts:** `heroOpenBook` has real `src: '/images/photobooks/hero/open-book.webp'` (file exists); 4 closed book colours have real `src` (files exist); `heroPrints` both `src: null`
- **library.ts:** 4 collections (wedding, family, travel, little); 90+ demo images, all `src: null` → procedural `DemoArtwork`; IDs must not change (spreads reference by id)

### `app/config/order.ts`

**Status:** COMPLETE

- Event types: wedding, birthday, private, corporate, brand (+ 'other' in checkout)
- Labels in Russian

### `.env.example`

**Status:** COMPLETE (template)

- `NUXT_TELEGRAM_BOT_TOKEN`, `NUXT_TELEGRAM_CHAT_ID`, `NUXT_TELEGRAM_API_BASE`
- Not configured → `/api/leads` returns 503

---

## 5. Missing Functionality

| Area | Missing | Status |
|------|---------|--------|
| Site-wide pages | About, Contacts, FAQ, Portfolio, Privacy content | PLACEHOLDER (PageStub only) |
| Service pages | Real photos for all services | All `src: null` |
| Photobook studio | Real library photos | All `src: null` → DemoArtwork |
| Photobook pricing | Real prices | Demo estimate; `isDemo: true` |
| Photozones | Real concept photos | Schematic SVG sketches |
| Booth | Real AI results, equipment photo | All placeholders; explicitly demo |
| Backend | Telegram bot not configured | 503 `not-configured` |
| Backend | Rate limiting on `/api/leads` | Not implemented |
| Checkout | No real contact data to reach the team | Brand contacts all null |
| Portfolio | No actual work samples | Stub page |
| Analytics | No analytics/tracking | Not present |
| Multi-language | Russian only | No i18n |
| User accounts | None | Not applicable (lead form only) |


---

## 6. Potential Bugs and Technical Risks

| # | Risk | Location | Severity | Mitigation |
|---|------|----------|----------|------------|
| 1 | `photozoneConcepts[1]!.gallery[0]!` non-null assertion crashes if concepts < 2 or empty gallery | `PhotozonesHero.vue:10` | Medium | Add fallback or defensive check |
| 2 | Server idempotency Map is in-memory; lost on restart → duplicate delivery possible | `leads.post.ts` | Low | Note in docs; acceptable for single-instance |
| 3 | `normalize()` accesses `library.images[0]!` — crashes if library empty | `lib/photobook.ts:207` | Low | Libraries are hardcoded non-empty |
| 4 | `createConfig` `nextSpreadSeq` parses `id.slice(2)` — breaks if ID format changes | `lib/photobook.ts:86` | Low | Contained; IDs stable |
| 5 | All photos missing → site looks like a template; trust impact | All service pages | High | Add real photos before launch (docs/IMAGES.md) |
| 6 | Demo prices labelled as such, but users may confuse with real | `pricing.ts`, `photozones.ts` | Medium | Keep `isDemo` labels prominent; switch to `on-request` before launch |
| 7 | No CSRF/rate limiting on public POST endpoint | `leads.post.ts` | Low | Add rate limiting if spam becomes an issue |
| 8 | `validateLead` server hardcodes `consent: true` | `leads.post.ts:51` | Low | By design (client enforces UI), but document |

---

## 7. Content and Asset Readiness

| Asset category | Required | Present | Status |
|---------------|----------|---------|--------|
| Hero photo | 1–2 (vertical ~6:7) | 0 | MISSING |
| Service card photos | 4 (4:5 vertical) | 0 | MISSING |
| Booth gallery | 10 AI portraits (3:4/4:5) | 0 | MISSING |
| Booth before/after | 3 pairs (4:5) | 0 | MISSING |
| Booth event cards | 5 (16:10/4:5) | 0 | MISSING |
| Booth equipment | 1 photo | 0 | MISSING |
| Photobook hero | open-book.webp (exists) + 4 closed colours (exist) | 5/6 | PARTIAL |
| Photobook prints | 2 (optional) | 0 | MISSING |
| Photobook library | ~90 images across 4 collections | 0 | MISSING (DemoArtwork used) |
| Photography | hero + 2 formats + photographer | 0 | MISSING |
| Photozones | hero + concept gallery + custom directions | 0 | MISSING (sketches used) |
| Portfolio | 12+ mixed | 0 | MISSING |

See `docs/IMAGES.md` for full brief, formats, and generation prompts.

**Image files that DO exist in `/public/images/photobooks/hero/`:**
- `open-book.webp` (35KB)
- `closed-milk.webp`, `closed-sand.webp`, `closed-violet.webp`, `closed-graphite.webp` (all present)

All other `public/images/*/` directories contain only `.gitkeep`.

---

## 8. Prioritized Recommendations

### P0 — Before launch (blocking)

1. **Configure Telegram bot** (`NUXT_TELEGRAM_BOT_TOKEN`, `NUXT_TELEGRAM_CHAT_ID`) or the checkout form cannot send requests. The form handles 503 gracefully, but no leads will reach the team.
2. **Add real photos** per `docs/IMAGES.md` — at minimum hero, service cards, and booth equipment. The placeholder system works, but a site with zero real photos lacks trust.
3. **Fill brand contacts** (`brand.ts`: phone, email, city, workingHours) and legal details — footer and checkout consent depend on these.
4. **Add privacy policy content** — checkout consent links to `/privacy`, which is currently a stub.
5. **Switch photobook pricing to `mode: 'on-request'`** until real print house prices are confirmed. Currently `isDemo: true` with fake figures.
6. **Fix `PhotozonesHero.vue` fragile array access** — replace `photozoneConcepts[1]!.gallery[0]!` with a defensive fallback.

### P1 — Before launch (important)

7. **Add real concept photos to photozones** — schematic SVG sketches are honest but temporary.
8. **Add FAQ page content** — navigation links to `/faq` which is a stub.
9. **Add portfolio content** — homepage PortfolioSection and `/portfolio` page are empty.
10. **Consider rate limiting on `/api/leads`** — public POST endpoint without spam protection.
11. **Verify all image `width`/`height` match actual files** to prevent layout shift.

### P2 — Post-launch

12. **Add photo upload to photobook studio** — currently only demo library images.
13. **Replace demo photobook pricing with real calculator/API** — `usePhotobookPrice.ts` is designed for this swap.
14. **Add analytics** (Yandex.Metrika / Google Analytics).
15. **Consider server-side idempotency persistence** (Redis/DB) if deploying to multiple instances.

---

## 9. Overall Assessment

**MOMENTO is a well-architected, production-quality codebase** with:
- A rigorous design system (CSS `@theme` tokens → Tailwind utilities)
- Accessible components (focus management, ARIA, reduced motion, native dialogs)
- Honest placeholder strategy (no fake work presented as real)
- Shared lead contract validated on both client and server
- Idempotent request submission with retry safety
- Full photobook studio with versioning and conflict resolution
- View Transition API page transitions with per-service presets

**It is not yet launch-ready** because:
- Zero real photography assets (all `src: null`)
- Telegram bot not configured (no lead delivery)
- Brand contacts and legal data missing
- Privacy policy and FAQ content missing
- Demo pricing in photobook/photozones

**Estimated effort to production readiness:** The code is complete; the remaining work is content (photos, copy, configuration) and infrastructure (Telegram bot credentials), not feature development.
