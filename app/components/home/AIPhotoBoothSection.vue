<script setup lang="ts">
import { ArrowRight, Sparkles } from '@lucide/vue'
import type { ImageAsset } from '~/types/service'

/*
 * Priority direction — visually highlighted, but the copy only describes the format.
 * Specific AI capabilities are not promised until equipment and software are confirmed.
 */

// Replace with real AI examples from /public/images/booth (with consent of the people shown).
const stack: { image: ImageAsset; class: string }[] = [
  {
    image: { src: null, alt: 'Пример AI-образа: портрет в стиле живописи', width: 900, height: 1200 },
    class: 'left-0 top-10 w-[52%] -rotate-6 md:group-hover/stack:-translate-x-3 md:group-hover/stack:-rotate-8',
  },
  {
    image: { src: null, alt: 'Пример AI-образа: кинематографичный портрет', width: 900, height: 1200 },
    class: 'right-0 top-0 w-[50%] rotate-5 md:group-hover/stack:translate-x-3 md:group-hover/stack:rotate-7',
  },
  {
    image: { src: null, alt: 'Исходное фото гостя из фотобудки', width: 900, height: 1200 },
    class: 'left-[24%] bottom-0 w-[52%] rotate-1 z-10 md:group-hover/stack:-translate-y-2',
  },
]

const section = useTemplateRef<HTMLElement>('section')
// Decorative loops run only while the block is on screen.
const { isInView } = useInView(section, { rootMargin: '120px 0px' })
</script>

<template>
  <section
    id="booth"
    ref="section"
    class="section-y clip-x"
    :class="!isInView && 'motion-paused'"
    aria-labelledby="booth-title"
  >
    <div class="container-page">
      <div
        class="relative isolate overflow-hidden rounded-[1.75rem] bg-[linear-gradient(140deg,var(--color-accent-soft)_0%,#f3f0f8_45%,var(--color-surface)_100%)] px-5 py-12 sm:px-10 md:py-16 lg:px-16 lg:py-20"
      >
        <!-- Glows: radial gradients moved with transform, no blur filters. -->
        <div
          class="pointer-events-none absolute -top-1/3 -right-1/4 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.28),transparent)] will-change-transform motion-safe:animate-glow-drift"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-1/3 -left-1/4 -z-10 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(117_100_168/0.16),transparent)] will-change-transform motion-safe:animate-glow-drift [animation-delay:-9s]"
          aria-hidden="true"
        />

        <div class="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div v-reveal class="flex flex-col items-start gap-6">
            <p class="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-accent uppercase">
              <Sparkles class="size-3.5" :stroke-width="2" aria-hidden="true" />
              AI-фотобудка
            </p>
            <h2 id="booth-title" class="font-display text-h2">
              AI-фотобудка — новый взгляд на&nbsp;ваши фото
            </h2>
            <p class="max-w-md text-lead text-muted">
              Быстро, весело и технологично. Создайте уникальные снимки с помощью AI.
            </p>
            <ul class="flex flex-wrap gap-2 text-sm text-text/85">
              <li class="rounded-full border border-accent/20 bg-surface/60 px-3.5 py-1.5">Свадьбы и праздники</li>
              <li class="rounded-full border border-accent/20 bg-surface/60 px-3.5 py-1.5">Корпоративы</li>
              <li class="rounded-full border border-accent/20 bg-surface/60 px-3.5 py-1.5">Выездной формат</li>
            </ul>
            <BaseButton to="/services/booth" size="lg" class="mt-2">
              Узнать больше
              <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
            </BaseButton>
          </div>

          <!-- Stacked prints -->
          <div v-reveal="120" class="group/stack relative mx-auto aspect-[1/1.02] w-full max-w-[30rem]">
            <div
              v-for="(card, index) in stack"
              :key="index"
              class="absolute rounded-card bg-surface p-2 pb-8 shadow-(--shadow-raised) transition-transform duration-(--motion-slow) ease-enter sm:p-2.5 sm:pb-10"
              :class="card.class"
            >
              <PhotoFrame :image="card.image" ratio="3 / 4" sizes="(min-width: 1024px) 260px, 50vw" :rounded="false" class="rounded-[0.5rem]" />
            </div>

            <Sparkles
              class="absolute top-[38%] -left-2 size-6 text-accent/70 motion-safe:animate-float-slow"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <Sparkles
              class="absolute -top-3 right-[42%] size-4 text-accent/50 motion-safe:animate-float-slow [animation-delay:-4s]"
              :stroke-width="1.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
