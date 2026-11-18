<script setup lang="ts">
import { Check, Info, X } from '@lucide/vue'

/**
 * Renders the toasts of useToast(). Lives once in the default layout. Native modal dialogs sit in
 * the top layer above it, so callers close their dialog before showing a toast.
 * The live region always exists, so screen readers announce new messages.
 */
const { toasts, dismiss, pause, resume } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 px-(--gutter) pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:pb-6"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex w-full max-w-[26rem] items-start gap-3 rounded-card bg-text py-3.5 pr-2 pl-4 text-bg shadow-[0_18px_48px_-18px_rgb(41_39_36/0.6)]"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
        @focusin="pause(toast.id)"
        @focusout="resume(toast.id)"
      >
        <span
          class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
          :class="toast.tone === 'info' ? 'bg-bg/15' : 'bg-success'"
          aria-hidden="true"
        >
          <component :is="toast.tone === 'info' ? Info : Check" class="size-3.5" :stroke-width="2.5" />
        </span>
        <div class="min-w-0 flex-1 py-0.5">
          <p class="text-sm font-semibold">{{ toast.title }}</p>
          <p v-if="toast.description" class="mt-0.5 text-[0.8125rem] leading-snug text-bg/70">{{ toast.description }}</p>
          <NuxtLink
            v-if="toast.action"
            :to="toast.action.to"
            class="mt-2 inline-flex min-h-8 items-center text-[0.8125rem] font-semibold underline underline-offset-4 hover:text-bg/80"
            @click="dismiss(toast.id)"
          >
            {{ toast.action.label }}
          </NuxtLink>
        </div>
        <button
          type="button"
          class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-bg/70 transition-colors hover:bg-bg/10 hover:text-bg"
          aria-label="Закрыть уведомление"
          @click="dismiss(toast.id)"
        >
          <X class="size-4" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    transform var(--motion-slow) var(--ease-enter),
    opacity var(--motion-normal) var(--ease-standard);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}

.toast-leave-active {
  position: absolute;
}
</style>
