import type { Directive } from 'vue'

/**
 * v-reveal — fade + slide-up when an element first enters the viewport.
 *
 *   <div v-reveal>…</div>
 *   <li v-for="(item, i) in items" v-reveal="i * 80">…</li>   // value = delay in ms
 *   <div v-reveal="{ delay: 120, distance: 12 }">…</div>
 *
 * Guarantees:
 * - SSR HTML never contains a hidden state: without JS, content is simply visible.
 * - Elements already in the viewport on mount are left untouched (no flash, no delayed LCP).
 * - One shared IntersectionObserver for the whole page; each element is unobserved after revealing.
 * - prefers-reduced-motion: reduce → the directive does nothing.
 */

type RevealValue = number | { delay?: number; distance?: number } | undefined

const MAX_DELAY = 480

let observer: IntersectionObserver | null = null

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        reveal(entry.target as HTMLElement)
      }
    },
    // Trigger slightly before the element is fully in view, so it never feels late.
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  )
  return observer
}

function reveal(el: HTMLElement) {
  observer?.unobserve(el)
  el.classList.add('reveal-active')
  el.classList.remove('reveal-pending')
  // Drop the transition afterwards so it never interferes with hover effects on the element.
  const cleanup = (event: TransitionEvent) => {
    if (event.target !== el || event.propertyName !== 'opacity') return
    el.removeEventListener('transitionend', cleanup)
    el.classList.remove('reveal-active')
    el.style.removeProperty('--reveal-delay')
    el.style.removeProperty('--reveal-distance')
  }
  el.addEventListener('transitionend', cleanup)
}

function normalize(value: RevealValue) {
  if (typeof value === 'number') return { delay: value, distance: undefined }
  return { delay: value?.delay ?? 0, distance: value?.distance }
}

const revealDirective: Directive<HTMLElement, RevealValue> = {
  getSSRProps: () => ({}),

  mounted(el, { value }) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Already visible on first paint → show as is.
    const { top } = el.getBoundingClientRect()
    if (top < window.innerHeight) return

    const { delay, distance } = normalize(value)
    if (delay > 0) el.style.setProperty('--reveal-delay', `${Math.min(delay, MAX_DELAY)}ms`)
    if (distance !== undefined) el.style.setProperty('--reveal-distance', `${distance}px`)

    el.classList.add('reveal-pending')
    getObserver().observe(el)
  },

  beforeUnmount(el) {
    observer?.unobserve(el)
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof revealDirective
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', revealDirective)
})
