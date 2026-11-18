<script setup lang="ts">
import { X } from '@lucide/vue'

/**
 * Modal dialog on top of the native <dialog>: focus trap, Esc, inert background and top layer
 * come from the browser. Bottom sheet on phones, centred card (radius 20px) from `sm` up.
 * Closes on Esc, on the close button and on a click on the backdrop.
 */
const props = withDefaults(
  defineProps<{
    title: string
    /** Visually hide the title (it still labels the dialog). */
    hideTitle?: boolean
    size?: 'md' | 'lg'
  }>(),
  { hideTitle: false, size: 'md' },
)

const open = defineModel<boolean>('open', { required: true })
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const uid = useId()

watch(
  open,
  (value) => {
    const el = dialog.value
    if (!el) return
    if (value && !el.open) {
      el.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!value && el.open) {
      el.close()
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  if (open.value) {
    dialog.value?.showModal()
    document.documentElement.style.overflow = 'hidden'
  }
})

function onClose() {
  // The `close` event is dispatched asynchronously. If the dialog was reopened in the meantime
  // (close → open again quickly), this event is stale and must not close the new session.
  if (dialog.value?.open) return
  document.documentElement.style.overflow = ''
  open.value = false
}

/* Backdrop click: the click target is the <dialog> itself only outside its content box. */
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})

defineExpose({ el: dialog })
</script>

<template>
  <dialog
    ref="dialog"
    class="base-dialog"
    :class="`size-${props.size}`"
    :aria-labelledby="`${uid}-title`"
    @cancel="open = false"
    @close="onClose"
    @click="onClick"
  >
    <div class="flex max-h-[inherit] flex-col">
      <header class="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-7 sm:pt-6">
        <h2 :id="`${uid}-title`" :class="hideTitle ? 'sr-only' : 'font-display text-[1.75rem] leading-tight'">{{ title }}</h2>
        <button
          type="button"
          class="-mt-1 -mr-2 ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-text/6"
          aria-label="Закрыть"
          @click="open = false"
        >
          <X class="size-5" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-7 sm:pb-7">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="shrink-0 border-t border-border px-5 py-4 sm:px-7">
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.base-dialog {
  margin: auto auto 0;
  width: 100%;
  max-width: 100%;
  max-height: 92svh;
  border-radius: var(--radius-modal) var(--radius-modal) 0 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 24px 60px -20px rgb(41 39 36 / 0.45);
  overflow: hidden;
  padding: 0;
}

@media (min-width: 640px) {
  .base-dialog {
    margin: auto;
    width: calc(100% - 2.5rem);
    max-height: min(88svh, 52rem);
    border-radius: var(--radius-modal);
  }

  .base-dialog.size-md {
    max-width: 40rem;
  }

  .base-dialog.size-lg {
    max-width: 58rem;
  }
}

.base-dialog::backdrop {
  background-color: rgb(41 39 36 / 0.45);
}

@media (prefers-reduced-motion: no-preference) {
  .base-dialog[open] {
    animation: dialog-in 420ms var(--ease-enter);
  }

  .base-dialog[open]::backdrop {
    animation: backdrop-in 300ms var(--ease-standard);
  }
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@keyframes backdrop-in {
  from {
    opacity: 0;
  }
}
</style>
