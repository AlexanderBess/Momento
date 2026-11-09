<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { boothFaq } from '~/config/booth'

/*
 * Native <details>/<summary>: keyboard, screen readers and find-in-page work out of the box,
 * and answers are in the HTML for search engines. Several answers can be open at once.
 * Smooth height is a progressive enhancement (::details-content + interpolate-size).
 */
</script>

<template>
  <section id="faq" class="section-y bg-surface" aria-labelledby="faq-title">
    <div class="container-page grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
      <SectionHeading
        v-reveal
        eyebrow="Вопросы"
        title="Частые вопросы"
        heading-id="faq-title"
        lead="Не нашли ответ? Задайте вопрос в заявке — мы ответим при обсуждении деталей."
        class="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start"
      />

      <div v-reveal="100" class="border-t border-border">
        <details v-for="item in boothFaq" :key="item.question" class="faq-item group border-b border-border">
          <summary
            class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-semibold transition-colors duration-(--motion-fast) hover:text-accent [&::-webkit-details-marker]:hidden"
          >
            <h3>{{ item.question }}</h3>
            <span
              class="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-text transition-[rotate,background-color,border-color,color] duration-(--motion-normal) ease-standard group-open:rotate-45 group-open:border-text group-open:bg-text group-open:text-bg"
              aria-hidden="true"
            >
              <Plus class="size-4" :stroke-width="2" />
            </span>
          </summary>
          <p class="max-w-2xl pb-6 text-[0.9375rem] leading-relaxed text-muted">{{ item.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .faq-item {
    interpolate-size: allow-keywords;
  }

  .faq-item::details-content {
    block-size: 0;
    overflow-y: clip;
    opacity: 0;
    transition:
      block-size var(--motion-normal) var(--ease-standard),
      opacity var(--motion-normal) var(--ease-standard),
      content-visibility var(--motion-normal) allow-discrete;
  }

  .faq-item[open]::details-content {
    block-size: auto;
    opacity: 1;
  }
}
</style>
