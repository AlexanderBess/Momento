<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

// Leads to the packages: the request is sent from there with the chosen package and add-ons.
</script>

<template>
  <!-- Second half of the closing: same white surface as the FAQ above, the dark card sits on it. -->
  <section id="photography-cta" class="bg-surface px-2 pb-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4" aria-labelledby="photo-cta-title">
    <div class="rounded-[1.5rem] bg-service-text text-bg sm:rounded-[1.75rem]">
      <div class="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-12 lg:items-end lg:gap-8">
        <h2 id="photo-cta-title" v-reveal class="font-display text-[clamp(2.75rem,1.6rem+5vw,6rem)] leading-[0.98] tracking-[-0.015em] lg:col-span-8">
          Давайте сохраним <em class="italic">вашу историю.</em>
        </h2>
        <div v-reveal="100" class="flex flex-col items-start gap-7 lg:col-span-4">
          <p class="text-lead text-bg/72">
            Расскажите нам о своём событии или идее съёмки. Вместе подберём подходящий формат.
          </p>
          <BaseButton to="#pricing" size="lg" class="w-full sm:w-auto">
            Обсудить съёмку
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
