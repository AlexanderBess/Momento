<script setup lang="ts">
import { ArrowRight, X } from '@lucide/vue'
import { services } from '~/config/services'
import { positionsLabel } from '~/lib/selection'

/**
 * «Моя подборка» — side drawer on top of the native <dialog> (focus trap, Esc, inert page and the
 * top layer come from the browser). Full-screen sheet on phones, a 28rem panel on the right from
 * `sm` up. Opening it only reads the selection — it never extends its 30-day retention.
 */
const { items, ready, count, total } = useCart()
const { drawerOpen, closeDrawer, goToCheckout } = useSelection()
const route = useRoute()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const uid = useId()
const shown = ref(false)
useScrollLock(shown)

watch(
  drawerOpen,
  (value) => {
    const el = dialog.value
    if (!el) return
    if (value && !el.open) {
      el.showModal()
      shown.value = true
    } else if (!value && el.open) {
      el.close()
      // Release the scroll lock now — the `close` event is asynchronous and not guaranteed.
      shown.value = false
    }
  },
  { flush: 'post' },
)

function onClose() {
  if (dialog.value?.open) return
  shown.value = false
  drawerOpen.value = false
}

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) closeDrawer()
}

// Following any link inside the drawer (services, «Открыть в Book Studio») closes it.
watch(() => route.fullPath, closeDrawer)

const onCheckout = computed(() => route.path === CHECKOUT_PATH)
</script>

<template>
  <dialog
    ref="dialog"
    class="selection-drawer"
    :aria-labelledby="`${uid}-title`"
    @cancel.prevent="closeDrawer"
    @close="onClose"
    @click="onClick"
  >
    <div class="flex h-full flex-col">
      <header class="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-6">
        <h2 :id="`${uid}-title`" class="flex items-baseline gap-3">
          <span class="font-display text-[1.75rem] leading-tight">Моя подборка</span>
          <span v-if="ready && count" class="text-sm text-muted">{{ positionsLabel(count) }}</span>
        </h2>
        <button
          type="button"
          class="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-text/6"
          aria-label="Закрыть подборку"
          @click="closeDrawer"
        >
          <X class="size-5" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div v-if="!ready" class="h-40" aria-busy="true" />

        <div v-else-if="!items.length">
          <p class="text-[0.9375rem] leading-relaxed text-muted">
            Подборка пока пуста. Выберите услуги — всё, что вы добавите, соберётся здесь в одну заявку.
          </p>
          <ul class="mt-6 grid gap-2">
            <li v-for="service in services" :key="service.slug">
              <NuxtLink
                :to="service.href"
                class="group flex min-h-14 items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-3 transition-colors hover:border-text/40"
                @click="closeDrawer"
              >
                <span class="font-semibold">{{ service.title }}</span>
                <ArrowRight class="size-4 text-muted transition-transform group-hover:translate-x-0.5" :stroke-width="2" aria-hidden="true" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <SelectionList v-else compact />
      </div>

      <footer v-if="ready && items.length" class="shrink-0 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div class="flex items-baseline justify-between gap-4">
          <span class="text-sm text-muted">Известная стоимость</span>
          <span class="text-xl font-semibold tabular-nums">{{ total.hasKnown ? formatRub(total.known) : 'Обсуждается' }}</span>
        </div>
        <p v-if="total.hasKnown && total.hasOnRequest" class="mt-0.5 text-right text-xs text-muted">+ позиции с индивидуальным расчётом</p>
        <p v-if="total.hasDemo" class="mt-0.5 text-right text-xs text-muted">Включает демо-цены</p>
        <BaseButton v-if="!onCheckout" size="lg" block class="mt-4" @click="goToCheckout">
          К оформлению заявки
          <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
        </BaseButton>
        <BaseButton v-else size="lg" block class="mt-4" @click="closeDrawer">Вернуться к оформлению</BaseButton>
        <p class="mt-3 text-center text-xs text-muted">Заявка не бронирует дату — мы свяжемся и всё согласуем.</p>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.selection-drawer {
  margin: 0 0 0 auto;
  width: 100%;
  max-width: 100%;
  height: 100dvh;
  max-height: 100dvh;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: -24px 0 60px -24px rgb(41 39 36 / 0.35);
  overflow: hidden;
}

@media (min-width: 640px) {
  .selection-drawer {
    max-width: 28rem;
  }
}

.selection-drawer::backdrop {
  background-color: rgb(41 39 36 / 0.45);
}

@media (prefers-reduced-motion: no-preference) {
  .selection-drawer[open] {
    animation: drawer-in 420ms var(--ease-enter);
  }

  .selection-drawer[open]::backdrop {
    animation: backdrop-in 300ms var(--ease-standard);
  }
}

@keyframes drawer-in {
  from {
    transform: translateX(2rem);
    opacity: 0;
  }
}

@keyframes backdrop-in {
  from {
    opacity: 0;
  }
}
</style>
