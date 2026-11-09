import type { MaybeRefOrGetter } from 'vue'

interface UseInViewOptions {
  rootMargin?: string
  threshold?: number | number[]
  /** Stop observing after the first time the element becomes visible. */
  once?: boolean
  /** Value used during SSR and before the observer reports. */
  initial?: boolean
}

/**
 * Reactive "is the element in the viewport" flag based on IntersectionObserver.
 * Used for the header scroll state and for pausing decorative animations off-screen.
 */
export function useInView(target: MaybeRefOrGetter<Element | null | undefined>, options: UseInViewOptions = {}) {
  const { rootMargin = '0px', threshold = 0, once = false, initial = false } = options
  const isInView = ref(initial)

  if (import.meta.server) return { isInView }

  let observer: IntersectionObserver | null = null

  const stop = () => {
    observer?.disconnect()
    observer = null
  }

  onMounted(() => {
    watch(
      () => toValue(target),
      (el) => {
        stop()
        if (!el) return
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry) return
            isInView.value = entry.isIntersecting
            if (once && entry.isIntersecting) stop()
          },
          { rootMargin, threshold },
        )
        observer.observe(el)
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(stop)

  return { isInView }
}
