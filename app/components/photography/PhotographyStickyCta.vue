<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

/*
 * Compact floating «Обсудить съёмку» for phones and tablets.
 * Appears once the hero has left the viewport; hides again while the pricing block (it has its own
 * order button) is on screen and from the final CTA onwards, so it never covers the footer.
 */
const { orderLink } = usePhotographyOrder()

const heroVisible = ref(true)
const pricingVisible = ref(false)
const ctaReached = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  const hero = document.getElementById('photography-hero')
  const pricing = document.getElementById('pricing')
  const cta = document.getElementById('photography-cta')

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === hero) heroVisible.value = entry.isIntersecting
      else if (entry.target === pricing) pricingVisible.value = entry.isIntersecting
      // In view, or already scrolled past (above the viewport).
      else if (entry.target === cta) ctaReached.value = entry.isIntersecting || entry.boundingClientRect.top < 0
    }
  })
  for (const el of [hero, pricing, cta]) if (el) observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())

const visible = computed(() => !heroVisible.value && !pricingVisible.value && !ctaReached.value)
</script>

<template>
  <Transition name="sticky-cta">
    <div
      v-if="visible"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end px-(--gutter) pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <NuxtLink
        :to="orderLink"
        class="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full bg-text pr-4 pl-5 text-sm font-semibold text-bg shadow-[0_12px_32px_-12px_rgb(41_39_36/0.55)] transition-[scale] duration-(--motion-normal) active:scale-[0.97]"
      >
        Обсудить съёмку
        <span class="inline-flex size-7 items-center justify-center rounded-full bg-accent" aria-hidden="true">
          <ArrowRight class="size-3.5" :stroke-width="2.25" />
        </span>
      </NuxtLink>
    </div>
  </Transition>
</template>

<style scoped>
.sticky-cta-enter-active,
.sticky-cta-leave-active {
  transition:
    transform var(--motion-slow) var(--ease-enter),
    opacity var(--motion-normal) var(--ease-standard);
}

.sticky-cta-enter-from,
.sticky-cta-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
