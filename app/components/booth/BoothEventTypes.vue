<script setup lang="ts">
import { Check, Plus } from '@lucide/vue'
import { boothEventCards } from '~/config/booth'
import type { EventType } from '~/config/order'

const selected = useBoothEvent()

function toggle(type: EventType) {
  selected.value = selected.value === type ? null : type
}

/*
 * Positional editorial layout.
 * Mobile: lead card full width, the rest in 2 columns.
 * Desktop (6-col grid): two large cards on top, three smaller below.
 */
const layout = [
  'col-span-2 lg:col-span-3',
  'col-span-2 sm:col-span-1 lg:col-span-3',
  'lg:col-span-2',
  'lg:col-span-2',
  'col-span-2 sm:col-span-1 lg:col-span-2',
]
// Aspect ratio per breakpoint, so cards sharing a row always have equal image heights.
const ratios = [
  { base: '16 / 10', sm: '16 / 9', lg: '16 / 10' },
  { base: '16 / 10', sm: '4 / 3', lg: '16 / 10' },
  { base: '4 / 5', sm: '4 / 3', lg: '4 / 5' },
  { base: '4 / 5', sm: '4 / 3', lg: '4 / 5' },
  { base: '16 / 10', sm: '4 / 3', lg: '4 / 5' },
]
</script>

<template>
  <section id="events" class="section-y" aria-labelledby="events-title">
    <div class="container-page">
      <SectionHeading
        v-reveal
        eyebrow="Для каких событий"
        title="Подходит для любого праздника"
        heading-id="events-title"
        lead="Выберите формат — мы учтём его в заявке и подберём образы под настроение события."
      />

      <ul class="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-14 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-12">
        <li v-for="(card, index) in boothEventCards" :key="card.type" v-reveal="index * 90" :class="layout[index]">
          <article
            class="group relative flex h-full cursor-pointer flex-col gap-4 rounded-card"
            @click="toggle(card.type)"
          >
            <div class="relative">
              <!-- Ratio changes per breakpoint, so it is applied by a wrapper instead of PhotoFrame. -->
              <div
                class="event-ratio relative overflow-hidden rounded-card ring-2 transition-[box-shadow] duration-(--motion-normal) ease-standard"
                :class="selected === card.type ? 'ring-accent ring-offset-2 ring-offset-bg' : 'ring-transparent'"
                :style="{ '--r-base': ratios[index]!.base, '--r-sm': ratios[index]!.sm, '--r-lg': ratios[index]!.lg }"
              >
                <PhotoFrame
                  :image="card.image"
                  ratio="fill"
                  zoom-on-hover
                  :rounded="false"
                  :sizes="index < 2 ? '(min-width: 1024px) 600px, 100vw' : '(min-width: 1024px) 400px, 50vw'"
                />
              </div>
              <span
                v-if="selected === card.type"
                class="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-(--shadow-soft)"
              >
                <Check class="size-3.5" :stroke-width="2.25" aria-hidden="true" />
                Выбрано
              </span>

              <!--
                Toggle sits on the photo corner, so a long title never competes with it for width
                (narrow 2-column cards on phones). The whole card is clickable too (see article @click).
              -->
              <button
                type="button"
                class="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full shadow-(--shadow-soft) transition-[background-color,color] duration-(--motion-normal) ease-standard"
                :class="
                  selected === card.type
                    ? 'bg-accent text-white'
                    : 'bg-surface/95 text-text group-hover:bg-text group-hover:text-bg'
                "
                :aria-pressed="selected === card.type"
                :aria-label="`Выбрать формат: ${card.title}`"
                @click.stop="toggle(card.type)"
              >
                <Check v-if="selected === card.type" class="size-4.5" :stroke-width="2" aria-hidden="true" />
                <Plus v-else class="size-4.5" :stroke-width="1.75" aria-hidden="true" />
              </button>
            </div>

            <div class="min-w-0">
              <h3 class="font-display text-h3 break-words">{{ card.title }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{{ card.text }}</p>
            </div>
          </article>
        </li>
      </ul>

      <p class="mt-8 text-sm text-muted" aria-live="polite">
        <template v-if="selected">
          Формат выбран — он будет передан в заявку.
          <NuxtLink to="#booking" class="font-semibold text-accent underline-offset-4 hover:underline">К заявке</NuxtLink>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.event-ratio {
  aspect-ratio: var(--r-base);
}

@media (min-width: 640px) {
  .event-ratio {
    aspect-ratio: var(--r-sm);
  }
}

@media (min-width: 1024px) {
  .event-ratio {
    aspect-ratio: var(--r-lg);
  }
}
</style>
