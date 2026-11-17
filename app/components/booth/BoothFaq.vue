<script setup lang="ts">
import { boothFaq } from '~/config/booth'
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

      <FaqAccordion v-reveal="100" :items="boothFaq" />
    </div>
  </section>
</template>
