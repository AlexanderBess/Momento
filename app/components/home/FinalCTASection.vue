<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { primaryCta } from '~/config/navigation'
</script>

<template>
  <section class="section-y clip-x" aria-labelledby="cta-title">
    <div class="container-page">
      <div v-reveal class="relative isolate flex flex-col items-center px-2 py-6 text-center md:py-10">
        <div
          class="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[30rem] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.14),transparent)] md:size-[44rem]"
          aria-hidden="true"
        />
        <p class="eyebrow">Ваше событие</p>
        <h2 id="cta-title" class="mt-5 max-w-3xl font-display text-h2">
          Готовы создать незабываемые воспоминания?
        </h2>
        <p class="mt-5 max-w-lg text-lead text-muted">
          Оставьте заявку — и мы подберём лучшее решение для вашего события.
        </p>
        <BaseButton :to="primaryCta.to" size="lg" class="mt-9">
          {{ primaryCta.label }}
          <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
        </BaseButton>
      </div>
    </div>
  </section>
</template>
