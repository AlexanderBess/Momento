<script setup lang="ts">
/**
 * Clip reveal for photos: the content is uncovered bottom-to-top the first time it scrolls into view.
 *
 * Same guarantees as v-reveal: SSR never hides anything, elements already on screen at mount are
 * left as they are, and reduced motion / low-end devices get no effect at all.
 */
const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const root = useTemplateRef<HTMLDivElement>('root')
const state = ref<'idle' | 'pending' | 'revealed'>('idle')
const { fullMotion } = useMotionLevel()

let observer: IntersectionObserver | null = null

onMounted(() => {
  // useMotionLevel sets its value in its own onMounted, which has already run (registered first).
  const el = root.value
  if (!el || !fullMotion.value) return
  if (el.getBoundingClientRect().top < window.innerHeight) return

  state.value = 'pending'
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      state.value = 'revealed'
      observer?.disconnect()
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="clip-reveal"
    :class="`is-${state}`"
    :style="props.delay ? { '--clip-delay': `${props.delay}ms` } : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.clip-reveal.is-pending {
  clip-path: inset(100% 0 0 0 round var(--radius-card));
}

.clip-reveal.is-revealed {
  clip-path: inset(0 0 0 0 round var(--radius-card));
  transition: clip-path 900ms var(--ease-enter) var(--clip-delay, 0ms);
}
</style>
