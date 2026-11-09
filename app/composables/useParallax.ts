import type { MaybeRefOrGetter } from 'vue'

/**
 * Light vertical parallax for a large image.
 *
 * - Writes a single `--parallax-y` CSS variable (px) on `target`; the element applies it via transform.
 * - The scroll listener exists only while `target` is near the viewport (IntersectionObserver gate),
 *   updates are batched with requestAnimationFrame.
 * - Disabled for reduced motion and low-end devices (see useMotionLevel).
 */
export function useParallax(target: MaybeRefOrGetter<HTMLElement | null | undefined>, strength = 40) {
  if (import.meta.server) return

  const { fullMotion } = useMotionLevel()
  const { isInView } = useInView(target, { rootMargin: '100px 0px' })

  let frame = 0
  const update = () => {
    frame = 0
    const el = toValue(target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    // -1 when the element's centre is at the bottom of the viewport, +1 at the top.
    const progress = 1 - (rect.top + rect.height / 2) / (window.innerHeight / 2)
    const clamped = Math.max(-1, Math.min(1, progress))
    el.style.setProperty('--parallax-y', `${(clamped * strength).toFixed(1)}px`)
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  const detach = () => {
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  watch([isInView, fullMotion], ([visible, enabled]) => {
    detach()
    if (visible && enabled) {
      window.addEventListener('scroll', onScroll, { passive: true })
      update()
    }
  })

  onBeforeUnmount(detach)
}
