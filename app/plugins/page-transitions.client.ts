import type { TransitionPreset } from '~/types/service'

/**
 * Page transitions — the single place that decides how a route change looks.
 *
 * Mechanics: Nuxt's built-in View Transitions integration (`experimental.viewTransition` in
 * nuxt.config) wraps every page-changing navigation — header, dropdown, in-page links, Back /
 * Forward — in `document.startViewTransition()` and holds the snapshot until the new page has
 * rendered (page:finish). It already skips:
 *   - navigations that keep the same page (hash / query changes, cart and modal state);
 *   - the initial load and hydration;
 *   - `prefers-reduced-motion: reduce` (the page simply switches);
 *   - browser swipe-back gestures that animate on their own (Safari);
 *   - browsers without the API (instant switch, nothing breaks).
 *
 * This plugin only resolves the preset: the destination page's `service` meta (definePageMeta), or
 * `neutral` for every other page. It is written to <html data-page-transition>, which the
 * ::view-transition-* rules in assets/css/transitions.css read. The pseudo-elements are built after
 * the router guards run, so the attribute is always in place in time.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const target = usePageTransitionTarget()

  router.beforeEach((to) => {
    const preset: TransitionPreset = to.meta.service ?? 'neutral'
    target.value = preset
    document.documentElement.dataset.pageTransition = preset
  })
})
