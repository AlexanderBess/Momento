/**
 * How much optional motion the current device should get.
 *
 * - `full`    — everything, including parallax and auto demos.
 * - `reduced` — `prefers-reduced-motion: reduce` or a low-end device
 *               (≤ 4 CPU cores or ≤ 4 GB RAM): no parallax, no auto demos.
 *
 * Only decorative extras read this. Interactive components work the same at any level.
 * During SSR and before mount the value is `reduced`, so nothing optional starts too early.
 */
export function useMotionLevel() {
  const level = ref<'full' | 'reduced'>('reduced')

  onMounted(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nav = navigator as Navigator & { deviceMemory?: number }
    const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
    level.value = prefersReduced || lowEnd ? 'reduced' : 'full'
  })

  return { fullMotion: computed(() => level.value === 'full') }
}
