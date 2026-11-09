<script setup lang="ts">
// A 1px sentinel at the very top: once it leaves the viewport the header switches to its solid surface.
const topSentinel = useTemplateRef<HTMLDivElement>('topSentinel')
const { isInView: atTop } = useInView(topSentinel, { initial: true, rootMargin: '16px 0px 0px 0px' })
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <div ref="topSentinel" class="pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden="true" />
    <a
      href="#main"
      class="sr-only-focusable fixed top-3 left-3 z-50 rounded-button bg-text px-4 py-3 text-sm font-semibold text-bg"
    >
      Перейти к содержимому
    </a>

    <AppHeader :scrolled="!atTop" />

    <main id="main" class="flex-1" tabindex="-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
