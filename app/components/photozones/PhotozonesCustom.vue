<script setup lang="ts">
import { Check, ShoppingBag } from '@lucide/vue'
import { photozoneCustomDirections } from '~/config/photozones'

/*
 * Individual projects: copy and the add-to-request action on one side, three visual directions
 * (florals / structures / personalisation) on the other — one large frame and two smaller ones.
 * On phones the directions become a horizontal snap row, so the section stays short.
 * The button adds «Фотозоны — индивидуальный проект» (price «Обсуждается») to the shared cart.
 */
const { addCustom, customInCart } = usePhotozoneOrder()
const { ready } = useCart()
const inCart = computed(() => ready.value && customInCart.value)

const [lead, ...rest] = photozoneCustomDirections
</script>

<template>
  <section id="custom" class="section-y" aria-labelledby="pz-custom-title">
    <div class="container-page grid gap-12 lg:grid-cols-12 lg:gap-8">
      <!-- ---------- Copy ---------- -->
      <div class="flex flex-col lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-5 lg:self-start">
        <p v-reveal class="eyebrow">04 / Individual</p>
        <h2 id="pz-custom-title" v-reveal="60" class="mt-5 font-display text-h2">
          Когда хочется <em class="text-(--color-accent) italic">чего-то особенного</em>
        </h2>
        <p v-reveal="100" class="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-muted">
          Не нашли подходящий вариант? Разработаем фотозону специально для вашего мероприятия. Учтём тематику праздника,
          цветовую гамму, особенности площадки и ваши пожелания.
        </p>

        <ul v-reveal="140" class="mt-8 grid gap-2.5 text-sm">
          <li v-for="item in ['Работаем с вашими референсами', 'Подбираем конструкции, цвета и декор', 'Стоимость рассчитываем индивидуально']" :key="item" class="flex items-center gap-3">
            <span class="h-px w-5 bg-(--pz-olive)" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>

        <div v-reveal="180" class="mt-10 flex flex-col gap-3 sm:items-start">
          <BaseButton size="lg" :variant="inCart ? 'secondary' : 'primary'" class="w-full sm:w-auto" @click="addCustom">
            <component :is="inCart ? Check : ShoppingBag" class="size-4" :stroke-width="2" aria-hidden="true" />
            {{ inCart ? 'Индивидуальный проект в заявке' : 'Выбрать индивидуальный проект' }}
          </BaseButton>
          <p class="text-xs text-muted">Стоимость: обсуждается. Изготовленные элементы также предоставляются в аренду.</p>
        </div>
      </div>

      <!-- ---------- Directions ---------- -->
      <!-- min-w-0: the phone snap row must not widen the grid column to its full content width. -->
      <div class="min-w-0 lg:col-span-7 lg:col-start-6">
        <ul
          class="no-scrollbar -mx-(--gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--gutter) md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0"
          aria-label="Направления индивидуального оформления"
        >
          <li v-if="lead" class="w-[78%] shrink-0 snap-start md:col-span-2 md:w-auto">
            <figure class="group">
              <ClipReveal>
                <PhotozoneVisual :asset="lead.visual" ratio="16 / 10" sizes="480px md:720px lg:680px" zoom-on-hover class="max-md:aspect-[4/5]!" />
              </ClipReveal>
              <figcaption v-reveal="60" class="mt-4 grid gap-1 md:grid-cols-[3rem_minmax(0,1fr)] md:gap-x-4">
                <span class="font-display text-lg text-muted italic" aria-hidden="true">01</span>
                <span>
                  <span class="block font-display text-[1.625rem] leading-tight">{{ lead.title }}</span>
                  <span class="mt-1 block text-[0.9375rem] leading-relaxed text-muted">{{ lead.text }}</span>
                </span>
              </figcaption>
            </figure>
          </li>
          <li v-for="(item, i) in rest" :key="item.id" class="w-[78%] shrink-0 snap-start md:w-auto" :class="i === 1 && 'md:pt-16'">
            <figure class="group">
              <ClipReveal :delay="i * 100">
                <PhotozoneVisual :asset="item.visual" ratio="4 / 5" sizes="480px md:360px" zoom-on-hover />
              </ClipReveal>
              <figcaption v-reveal="60 + i * 80" class="mt-4 grid gap-1">
                <span class="font-display text-lg text-muted italic" aria-hidden="true">{{ String(i + 2).padStart(2, '0') }}</span>
                <span class="font-display text-[1.625rem] leading-tight">{{ item.title }}</span>
                <span class="text-[0.9375rem] leading-relaxed text-muted">{{ item.text }}</span>
              </figcaption>
            </figure>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
