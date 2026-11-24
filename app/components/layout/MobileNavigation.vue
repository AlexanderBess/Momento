<script setup lang="ts">
import { ArrowUpRight, ChevronDown, X } from '@lucide/vue'
import { brand } from '~/config/brand'
import { mainNavigation, primaryCta } from '~/config/navigation'

/**
 * Mobile menu built on the native <dialog> element:
 * showModal() gives a focus trap, inert background, Esc to close and the top layer for free.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const shown = ref(false)
useScrollLock(shown)

// Which section (by its `to`) has its sub-list expanded; one at a time, reset on every close.
const expanded = ref<string | null>(null)
const toggle = (to: string) => {
  expanded.value = expanded.value === to ? null : to
}
const sectionId = (to: string) => `mobile-nav${to.replace(/\W+/g, '-')}`

watch(
  () => props.open,
  (open) => {
    const el = dialog.value
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      shown.value = true
    } else if (!open) {
      if (el.open) el.close()
      shown.value = false
      expanded.value = null
    }
  },
)

function onClose() {
  if (dialog.value?.open) return
  shown.value = false
  expanded.value = null
  if (props.open) emit('close')
}

// The dialog is hidden from lg up (CSS). If the viewport crosses that breakpoint while the
// menu is open (tablet rotation, window resize), close it — otherwise the page would stay inert.
let desktopQuery: MediaQueryList | null = null
const onBreakpoint = (event: MediaQueryListEvent) => {
  if (event.matches && props.open) emit('close')
}

onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 1024px)')
  desktopQuery.addEventListener('change', onBreakpoint)
})

onBeforeUnmount(() => {
  desktopQuery?.removeEventListener('change', onBreakpoint)
})
</script>

<template>
  <dialog
    ref="dialog"
    class="mobile-nav m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-text lg:hidden"
    aria-label="Меню"
    @cancel.prevent="emit('close')"
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

    <nav aria-label="Основная навигация" class="container-page flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pt-6 pb-8">
      <ul class="flex flex-col">
        <li v-for="item in mainNavigation" :key="item.to" class="border-b border-border/70">
          <template v-if="item.children?.length">
            <button
              type="button"
              class="flex min-h-16 w-full items-center justify-between py-3 text-left font-display text-[2rem] leading-tight"
              :class="item.children.some((child) => child.to === route.path) && 'text-accent'"
              :aria-expanded="expanded === item.to"
              :aria-controls="sectionId(item.to)"
              @click="toggle(item.to)"
            >
              {{ item.label }}
              <ChevronDown
                class="size-5 text-muted-soft transition-transform duration-(--motion-normal) ease-standard"
                :class="expanded === item.to && 'rotate-180'"
                :stroke-width="1.5"
                aria-hidden="true"
              />
            </button>

            <!-- grid-rows 0fr → 1fr animates to the content's natural height. -->
            <div
              :id="sectionId(item.to)"
              class="grid transition-[grid-template-rows,opacity] duration-(--motion-normal) ease-standard"
              :class="expanded === item.to ? 'grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'"
            >
              <ul class="min-h-0 overflow-hidden pb-3">
                <li v-for="child in item.children" :key="child.to">
                  <NuxtLink
                    :to="child.to"
                    class="-mx-3 block rounded-button px-3 py-2.5 transition-colors duration-(--motion-fast) hover:bg-text/5 aria-[current=page]:bg-text/5"
                    @click="emit('close')"
                  >
                    <span class="block text-base font-medium">{{ child.label }}</span>
                    <span v-if="child.description" class="block text-sm leading-snug text-muted">
                      {{ child.description }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </template>
          <NuxtLink
            v-else
            :to="item.to"
            class="group flex min-h-16 items-center justify-between py-3 font-display text-[2rem] leading-tight aria-[current=page]:text-accent"
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
