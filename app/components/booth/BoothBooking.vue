<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { buildOrderLink, eventTypeLabels, eventTypes } from '~/config/order'

const selected = useBoothEvent()
const orderLink = computed(() => buildOrderLink({ service: 'booth', event: selected.value ?? undefined }))
</script>

<template>
  <section id="booking" class="section-y clip-x" aria-labelledby="booking-title">
    <div class="container-page">
      <div v-reveal class="relative isolate flex flex-col items-center px-2 py-6 text-center md:py-10">
        <div
          class="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[30rem] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.14),transparent)] md:size-[44rem]"
          aria-hidden="true"
        />
        <p class="eyebrow">Заявка</p>
        <h2 id="booking-title" class="mt-5 max-w-3xl font-display text-h2">Добавьте немного магии в своё мероприятие</h2>
        <p class="mt-5 max-w-lg text-lead text-muted">
          Расскажите о вашем мероприятии, а мы поможем подобрать подходящий формат.
        </p>

        <!-- Optional event type: native radios (arrow-key navigation for free), passed to /order as ?event= -->
        <fieldset class="mt-9 flex max-w-2xl flex-col items-center gap-3">
          <legend class="mb-3 text-sm font-semibold">Тип мероприятия <span class="font-normal text-muted">— необязательно</span></legend>
          <div class="flex flex-wrap justify-center gap-2">
            <label
              v-for="type in eventTypes"
              :key="type"
              class="inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color] duration-(--motion-normal) ease-standard has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              :class="selected === type ? 'border-text bg-text text-bg' : 'border-border bg-surface text-text hover:border-text/40'"
            >
              <input v-model="selected" type="radio" name="booth-event" :value="type" class="sr-only" >
              {{ eventTypeLabels[type] }}
            </label>
          </div>
          <button
            v-if="selected"
            type="button"
            class="min-h-11 px-3 text-sm text-muted underline-offset-4 hover:text-text hover:underline"
            @click="selected = null"
          >
            Сбросить выбор
          </button>
        </fieldset>

        <BaseButton :to="orderLink" size="lg" class="mt-8">
          Оставить заявку
          <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
        </BaseButton>
      </div>
    </div>
  </section>
</template>
