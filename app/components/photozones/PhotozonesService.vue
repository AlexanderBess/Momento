<script setup lang="ts">
import { ClipboardCheck, PackageOpen, Truck, Wrench } from '@lucide/vue'
import type { Component } from 'vue'
import { photozoneServiceSteps } from '~/config/photozones'

/*
 * Full service: four stages in a quiet row (2 × 2 on tablets, a list on phones), each with a thin
 * icon on a sage disc. A note below says what depends on the venue and who owns the decor.
 */
const icons: Record<(typeof photozoneServiceSteps)[number]['id'], Component> = {
  prepare: ClipboardCheck,
  delivery: Truck,
  install: Wrench,
  dismantle: PackageOpen,
}
</script>

<template>
  <section id="service" class="section-y bg-surface" aria-labelledby="pz-service-title">
    <div class="container-page">
      <SectionHeading v-reveal eyebrow="05 / Full Service" title="Вам остаётся только наслаждаться событием" heading-id="pz-service-title" />

      <ol class="mt-12 grid gap-x-8 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(step, i) in photozoneServiceSteps"
          :key="step.id"
          v-reveal="i * 100"
          class="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 border-t border-border py-7 lg:grid-cols-1 lg:gap-y-6 lg:pt-8"
        >
          <span class="inline-flex size-14 items-center justify-center rounded-full bg-(--pz-mist) text-(--color-accent)" aria-hidden="true">
            <component :is="icons[step.id]" class="size-6" :stroke-width="1.25" />
          </span>
          <div class="flex flex-col gap-1.5">
            <span class="font-display text-lg leading-none text-muted italic" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="mt-1 text-lg font-semibold">{{ step.title }}</h3>
            <p class="text-[0.9375rem] leading-relaxed text-muted">{{ step.text }}</p>
          </div>
        </li>
      </ol>

      <p v-reveal class="mt-8 max-w-2xl border-l-2 border-(--pz-olive) pl-5 text-sm leading-relaxed text-muted md:mt-10">
        Стоимость доставки зависит от расположения площадки — рассчитаем её вместе с заявкой. Декорации, в том числе
        изготовленные специально для вашего события, предоставляются в аренду и остаются собственностью MOMENTO.
      </p>
    </div>
  </section>
</template>
