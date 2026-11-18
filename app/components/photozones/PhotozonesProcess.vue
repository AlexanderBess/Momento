<script setup lang="ts">
import { Info } from '@lucide/vue'
import { photozoneOrderSteps } from '~/config/photozones'

/*
 * How ordering works: heading and the «manual confirmation» note on the left, the four steps as a
 * large-numeral list with hairlines on the right. Deliberately different from the icon row above.
 */
</script>

<template>
  <section id="process" class="section-y" aria-labelledby="pz-process-title">
    <div class="container-page grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div class="lg:col-span-5">
        <p v-reveal class="eyebrow">06 / How It Works</p>
        <h2 id="pz-process-title" v-reveal="60" class="mt-5 font-display text-h2">Как происходит заказ</h2>
        <div v-reveal="120" class="mt-8 flex max-w-sm gap-3 rounded-card bg-(--pz-mist)/70 p-5 text-sm leading-relaxed">
          <Info class="mt-0.5 size-4 shrink-0 text-(--color-accent)" :stroke-width="2" aria-hidden="true" />
          <p>
            Отправка заявки не означает автоматического бронирования. Заказ подтверждается вручную после согласования
            с вами.
          </p>
        </div>
      </div>

      <ol class="lg:col-span-7">
        <li
          v-for="(step, i) in photozoneOrderSteps"
          :key="step"
          v-reveal="i * 90"
          class="grid grid-cols-[4rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-border py-6 first:border-t md:grid-cols-[6rem_minmax(0,1fr)] md:py-8"
        >
          <span class="font-display text-[clamp(2.5rem,2rem+2vw,3.75rem)] leading-none text-(--pz-olive)/55 italic" aria-hidden="true">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <p class="text-lg leading-snug md:text-xl">{{ step }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
