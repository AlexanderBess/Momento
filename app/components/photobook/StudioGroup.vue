<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

/**
 * Collapsible settings group of the studio panel (disclosure pattern: button + region).
 * `summary` shows the current choice while the group is closed, so the panel stays scannable.
 */
const props = defineProps<{ index: number; title: string; summary?: string }>()
const open = defineModel<boolean>('open', { default: false })

const uid = useId()
</script>

<template>
  <section class="border-b border-border last:border-b-0">
    <h3>
      <button
        :id="`${uid}-head`"
        type="button"
        class="group/head flex min-h-16 w-full items-center gap-4 py-4 text-left"
        :aria-expanded="open"
        :aria-controls="`${uid}-body`"
        @click="open = !open"
      >
        <span
          class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-(--motion-normal)"
          :class="open ? 'bg-text text-bg' : 'bg-surface-muted text-text'"
          aria-hidden="true"
        >
          {{ props.index }}
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="text-[0.9375rem] font-semibold transition-colors group-hover/head:text-accent">{{ title }}</span>
          <span v-if="summary" class="truncate text-xs text-muted">{{ summary }}</span>
        </span>
        <ChevronDown
          class="size-4 shrink-0 text-muted transition-transform duration-(--motion-normal) ease-standard"
          :class="open && 'rotate-180'"
          :stroke-width="2"
          aria-hidden="true"
        />
      </button>
    </h3>
    <div :id="`${uid}-body`" role="region" :aria-labelledby="`${uid}-head`" class="group-body" :class="open && 'is-open'" :inert="!open">
      <div class="overflow-hidden">
        <div class="flex flex-col gap-6 pt-1 pb-7">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Height animation without measuring: a 0fr → 1fr grid row. */
.group-body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows var(--motion-slow) var(--ease-enter),
    opacity var(--motion-normal) var(--ease-standard);
}

.group-body.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}
</style>
