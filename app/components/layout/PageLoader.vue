<script setup lang="ts">
/**
 * Real-load indicator — not a transition effect.
 *
 * Driven by Nuxt's own loading state (page:loading:start / end: route chunk download, middleware,
 * async page setup). Throttled: nothing is shown unless loading takes longer than 250 ms, so
 * instant navigations never flash it. A thin hairline in the destination page's accent colour —
 * no spinner, no overlay, nothing blocks the page; it disappears as soon as the page is ready.
 */
const { progress, isLoading } = useLoadingIndicator({ throttle: 250, duration: 1600, hideDelay: 120, resetDelay: 280 })
const target = usePageTransitionTarget()

const service = computed(() => (target.value === 'neutral' ? undefined : target.value))
</script>

<template>
  <div
    class="page-loader pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    :class="{ 'is-loading': isLoading }"
    :data-service="service"
    aria-hidden="true"
  >
    <div class="page-loader-bar h-full origin-left bg-accent" :style="{ transform: `scaleX(${progress / 100})` }" />
  </div>
</template>

<style scoped>
.page-loader {
  opacity: 0;
  transition: opacity var(--motion-normal) var(--ease-standard);
  /* Own snapshot layer, so it stays visible above the page during a view transition. */
  view-transition-name: page-loader;
}

.page-loader.is-loading {
  opacity: 1;
}

.page-loader-bar {
  transition: transform 200ms linear;
}
</style>
