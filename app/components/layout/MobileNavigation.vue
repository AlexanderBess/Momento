<script setup lang="ts">
import { ArrowUpRight, X } from '@lucide/vue'
import { brand } from '~/config/brand'
import { mainNavigation, primaryCta } from '~/config/navigation'

/**
 * Mobile menu built on the native <dialog> element:
 * showModal() gives a focus trap, inert background, Esc to close and the top layer for free.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(
  () => props.open,
  (open) => {
    const el = dialog.value
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && el.open) {
      el.close()
    }
  },
)

function onClose() {
  document.documentElement.style.overflow = ''
  if (props.open) emit('close')
}

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <dialog
    ref="dialog"
    class="mobile-nav m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-text lg:hidden"
    aria-label="Меню"
    @close="onClose"
  >
    <div class="container-page flex h-(--header-height) items-center justify-between">
      <span class="text-[1.0625rem] font-bold tracking-[0.28em] uppercase" aria-hidden="true">{{ brand.name }}</span>
      <button
        type="button"
        class="-mr-2 inline-flex size-11 items-center justify-center rounded-button transition-colors duration-(--motion-fast) hover:bg-text/5"
        aria-label="Закрыть меню"
        @click="emit('close')"
      >
        <X class="size-6" :stroke-width="1.5" aria-hidden="true" />
      </button>
    </div>

    <nav aria-label="Основная навигация" class="container-page flex flex-1 flex-col pt-6 pb-8">
      <ul class="flex flex-col">
        <li v-for="item in mainNavigation" :key="item.to" class="border-b border-border/70">
          <NuxtLink
            :to="item.to"
            class="group flex min-h-16 items-center justify-between py-3 font-display text-[2rem] leading-tight"
            @click="emit('close')"
          >
            {{ item.label }}
            <ArrowUpRight
              class="size-5 text-muted-soft transition-transform duration-(--motion-normal) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              :stroke-width="1.5"
              aria-hidden="true"
            />
          </NuxtLink>
        </li>
      </ul>

      <div class="mt-auto pt-10">
        <BaseButton :to="primaryCta.to" size="lg" block @click="emit('close')">{{ primaryCta.label }}</BaseButton>
        <p class="mt-4 text-center text-sm text-muted">{{ brand.region }}</p>
      </div>
    </nav>
  </dialog>
</template>

<style scoped>
.mobile-nav[open] {
  display: flex;
  flex-direction: column;
}

.mobile-nav::backdrop {
  background: transparent;
}

@media (prefers-reduced-motion: no-preference) {
  .mobile-nav {
    transition:
      opacity var(--motion-normal) var(--ease-standard),
      transform var(--motion-normal) var(--ease-enter),
      overlay var(--motion-normal) allow-discrete,
      display var(--motion-normal) allow-discrete;
    opacity: 0;
    transform: translateY(-8px);
  }

  .mobile-nav[open] {
    opacity: 1;
    transform: none;
  }

  @starting-style {
    .mobile-nav[open] {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
}
</style>
