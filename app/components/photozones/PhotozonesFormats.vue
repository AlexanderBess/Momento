<script setup lang="ts">
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { photozoneFormats } from '~/config/photozones'

/*
 * «Какую фотозону вы ищете?» — two directions as two large visual blocks of different proportions:
 * the ready collection (wide, landscape) and the individual project (narrow, portrait, set lower).
 * Both buttons scroll to their section on this page.
 */
</script>

<template>
  <section id="formats" class="section-y" aria-labelledby="pz-formats-title">
    <div class="container-page">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div class="lg:col-span-7">
          <p v-reveal class="eyebrow">02 / Formats</p>
          <h2 id="pz-formats-title" v-reveal="60" class="mt-5 font-display text-h2">Какую фотозону вы ищете?</h2>
        </div>
        <p v-reveal="120" class="max-w-md text-[0.9375rem] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
          Готовые концепции с известной стоимостью или оформление, созданное специально под ваше событие. Доставка,
          монтаж и демонтаж — в обоих случаях.
        </p>
      </div>

      <div class="mt-12 grid gap-14 md:mt-16 lg:grid-cols-12 lg:gap-8">
        <!-- Ready collection -->
        <article class="group flex flex-col lg:col-span-7" aria-labelledby="pz-format-ready">
          <ClipReveal>
            <PhotozoneVisual :asset="photozoneFormats.ready" ratio="4 / 3" sizes="720px lg:700px" zoom-on-hover />
          </ClipReveal>
          <div v-reveal="80" class="mt-7 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-8">
            <div>
              <p class="eyebrow text-(--color-accent)">Готовые решения</p>
              <h3 id="pz-format-ready" class="mt-3 font-display text-h3">Коллекция MOMENTO</h3>
              <p class="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                Выберите фотозону из нашей коллекции. Известная базовая стоимость и возможность дополнить оформление.
              </p>
            </div>
            <BaseButton to="#collection" variant="secondary">
              Смотреть коллекцию
              <template #icon><ArrowDown class="size-4" :stroke-width="2" /></template>
            </BaseButton>
          </div>
        </article>

        <!-- Individual project -->
        <article class="group flex flex-col lg:col-span-4 lg:col-start-9 lg:pt-28" aria-labelledby="pz-format-custom">
          <ClipReveal :delay="120">
            <PhotozoneVisual :asset="photozoneFormats.custom" ratio="4 / 5" sizes="720px lg:420px" zoom-on-hover />
          </ClipReveal>
          <div v-reveal="140" class="mt-7 flex flex-col gap-5">
            <div>
              <p class="eyebrow text-(--color-accent)">Индивидуальный проект</p>
              <h3 id="pz-format-custom" class="mt-3 font-display text-h3">Оформление под ваше событие</h3>
              <p class="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                Создадим оформление специально для вашего мероприятия с учётом ваших пожеланий и особенностей площадки.
              </p>
            </div>
            <BaseButton to="#custom" variant="secondary" class="self-start">
              Обсудить проект
              <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
            </BaseButton>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
