<script setup lang="ts">
import { Gem, HeartHandshake, Timer, UsersRound } from '@lucide/vue'
import type { Component } from 'vue'
import { benefits, type BenefitIcon } from '~/config/benefits'

const icons: Record<BenefitIcon, Component> = {
  speed: Timer,
  premium: Gem,
  personal: HeartHandshake,
  team: UsersRound,
}
</script>

<template>
  <section id="benefits" class="section-y bg-surface" aria-labelledby="benefits-title">
    <div class="container-page">
      <SectionHeading v-reveal eyebrow="Почему мы" title="Мы делаем события особенными" heading-id="benefits-title" />

      <ul class="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
        <li
          v-for="(benefit, index) in benefits"
          :key="benefit.icon"
          v-reveal="index * 90"
          class="flex flex-col gap-4 border-t border-border pt-6"
        >
          <div class="flex items-center justify-between">
            <component :is="icons[benefit.icon]" class="size-7 text-accent" :stroke-width="1.25" aria-hidden="true" />
            <span class="font-display text-xl text-muted-soft" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <h3 class="text-lg font-semibold">{{ benefit.title }}</h3>
          <p class="text-[0.9375rem] leading-relaxed text-muted">{{ benefit.text }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
