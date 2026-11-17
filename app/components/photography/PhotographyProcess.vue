<script setup lang="ts">
import { photographySteps } from '~/config/photography'

/*
 * Five stages joined by a thin line: vertical on phones / tablets, horizontal from `lg`.
 * The line draws itself segment by segment when the list first enters the viewport, the stages
 * appear one after another. Without JS and with reduced motion everything is simply visible.
 */
const LAST = photographySteps.length - 1

const list = useTemplateRef<HTMLOListElement>('list')
const { isInView } = useInView(list, { once: true, rootMargin: '0px 0px -15% 0px' })
const drawn = ref(true)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Already on screen at mount → leave it drawn; otherwise draw on first entry.
  if (list.value && list.value.getBoundingClientRect().top >= window.innerHeight) {
    drawn.value = false
    watch(isInView, (visible) => visible && (drawn.value = true), { immediate: true })
  }
})
</script>

<template>
  <section id="process" class="section-y" aria-labelledby="process-title">
    <div class="container-page">
      <SectionHeading
        v-reveal
        eyebrow="03 / How It Works"
        title="От первой встречи до готовых фотографий."
        heading-id="process-title"
      />

      <ol ref="list" class="mt-12 grid gap-9 md:mt-16 lg:grid-cols-5 lg:gap-6" :class="drawn && 'is-drawn'">
        <li
          v-for="(step, index) in photographySteps"
          :key="step.title"
          v-reveal="index * 110"
          class="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-5 lg:grid-cols-1 lg:gap-y-6"
        >
          <!-- Connector from this dot to the next one -->
          <span
            v-if="index < LAST"
            class="connector pointer-events-none absolute bg-text/25"
            :style="{ '--delay': `${index * 220}ms` }"
            aria-hidden="true"
          />
          <span class="dot relative z-10 size-3 justify-self-center rounded-full border border-text bg-bg lg:justify-self-start" aria-hidden="true" />

          <div class="-mt-1 flex flex-col gap-1.5 lg:mt-0 lg:pr-4">
            <span class="font-display text-lg leading-none text-muted italic" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <h3 class="mt-1 text-lg font-semibold">{{ step.title }}</h3>
            <p class="text-[0.9375rem] leading-relaxed text-muted">{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
/* Vertical: from this dot's centre (column 1.5rem, dot 12px) to the next one — li height + row gap (2.25rem). */
.connector {
  top: 0.375rem;
  left: calc(0.75rem - 0.5px);
  width: 1px;
  height: calc(100% + 2.25rem);
  transform-origin: top;
  transform: scaleY(0);
  transition: transform 700ms var(--ease-enter) var(--delay, 0ms);
}

/* Horizontal: column width + column gap (1.5rem). */
@media (min-width: 1024px) {
  .connector {
    top: calc(0.375rem - 0.5px);
    left: 0.375rem;
    width: calc(100% + 1.5rem);
    height: 1px;
    transform-origin: left;
    transform: scaleX(0);
  }
}

.is-drawn .connector {
  transform: none;
}
</style>
