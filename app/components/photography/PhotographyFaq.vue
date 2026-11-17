<script setup lang="ts">
import { photographyFaq } from '~/config/photography'
</script>

<template>
  <!-- First half of the page's closing: FAQ flows straight into the dark CTA on the same white surface. -->
  <section id="faq" class="bg-surface pt-[clamp(4rem,2.5rem+6vw,8rem)] pb-14 md:pb-20" aria-labelledby="photo-faq-title">
    <div class="container-page grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
      <SectionHeading
        v-reveal
        eyebrow="07 / FAQ"
        title="Частые вопросы"
        heading-id="photo-faq-title"
        class="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start"
      />

      <FaqAccordion v-reveal="100" :items="photographyFaq" />
    </div>
  </section>
</template>
