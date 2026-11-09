<script setup lang="ts">
import { Menu, ShoppingBag } from '@lucide/vue'
import { cartLink, mainNavigation, primaryCta } from '~/config/navigation'

/**
 * `scrolled` is driven by a sentinel at the top of the page (see layouts/default.vue)
 * instead of a scroll listener — no work on every scroll frame.
 */
defineProps<{ scrolled: boolean }>()

const menuOpen = ref(false)
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton')

function closeMenu({ restoreFocus = true } = {}) {
  menuOpen.value = false
  if (restoreFocus) nextTick(() => menuButton.value?.focus())
}

const route = useRoute()
watch(
  () => route.fullPath,
  () => closeMenu({ restoreFocus: false }),
)
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-(--motion-normal) ease-standard"
    :class="
      scrolled || menuOpen
        ? 'border-border/70 bg-bg shadow-[0_1px_0_rgb(41_39_36/0.02),0_8px_24px_-20px_rgb(41_39_36/0.25)]'
        : 'border-transparent bg-bg/0'
    "
  >
    <div class="container-page flex h-(--header-height) items-center gap-6">
      <AppLogo />

      <nav aria-label="Основная навигация" class="ml-auto hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in mainNavigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="relative rounded-button px-3.5 py-2 text-sm font-medium text-text/80 transition-colors duration-(--motion-fast) hover:text-text aria-[current=page]:text-text"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-3">
        <NuxtLink
          :to="cartLink.to"
          :aria-label="cartLink.label"
          class="inline-flex size-11 items-center justify-center rounded-button text-text transition-colors duration-(--motion-fast) hover:bg-text/5"
        >
          <ShoppingBag class="size-5" :stroke-width="1.5" aria-hidden="true" />
        </NuxtLink>

        <!-- Wrapper owns visibility: a display utility on BaseButton itself would compete with its inline-flex. -->
        <div class="hidden lg:block">
          <BaseButton :to="primaryCta.to">{{ primaryCta.label }}</BaseButton>
        </div>

        <button
          ref="menuButton"
          type="button"
          class="inline-flex size-11 items-center justify-center rounded-button text-text transition-colors duration-(--motion-fast) hover:bg-text/5 lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          aria-label="Открыть меню"
          @click="menuOpen = true"
        >
          <Menu class="size-6" :stroke-width="1.5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <MobileNavigation id="mobile-navigation" :open="menuOpen" @close="closeMenu()" />
  </header>
</template>
