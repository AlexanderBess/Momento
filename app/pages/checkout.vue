<script setup lang="ts">
import { ArrowLeft, ArrowRight, Info, Pencil, Trash2 } from '@lucide/vue'
import { findService, services } from '~/config/services'
import { primaryCta } from '~/config/navigation'
import type { CartItem } from '~/types/cart'

/**
 * The shared request (cart): every position added on service pages via useCart().
 * «Изменить» opens the service's own edit dialog right here when the position has one (photo zones:
 * a ready concept and its options). Positions without editable settings only link to their service page.
 * Event date, time and venue are not per position — they are asked once for the whole request.
 */
useSeoMeta({ title: 'Корзина', robots: 'noindex, follow' })

const { items, ready, total, remove } = useCart()
const { editConcept } = usePhotozoneOrder()

/** Opens the matching editor; `null` when the position has nothing to edit. */
function editorFor(item: CartItem): (() => void) | null {
  const conceptId = editablePhotozoneConcept(item)
  if (conceptId) return () => editConcept(conceptId)
  return null
}

const priceText = (price: number | null, partial?: boolean) =>
  price === null ? 'Обсуждается' : `${formatRub(price)}${partial ? ' + обсуждается' : ''}`

const positions = (n: number) =>
  `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'позиция' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'позиции' : 'позиций'}`
</script>

<template>
  <section class="container-page pt-10 pb-20 md:pt-14 md:pb-28">
    <SectionHeading as="h1" eyebrow="Корзина" title="Ваша заявка" />

    <!-- Saved cart is read on the client; keep the space quiet until then. -->
    <div v-if="!ready" class="mt-12 h-40" aria-busy="true" />

    <div v-else-if="!items.length" class="mt-12 max-w-xl">
      <p class="text-lead text-muted">В заявке пока ничего нет. Выберите услугу — всё, что вы добавите, соберётся здесь в одну заявку.</p>
      <ul class="mt-8 grid gap-2 sm:grid-cols-2">
        <li v-for="service in services" :key="service.slug">
          <NuxtLink
            :to="service.href"
            class="group flex min-h-14 items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-3 transition-colors hover:border-text/40"
          >
            <span class="font-semibold">{{ service.title }}</span>
            <ArrowRight class="size-4 text-muted transition-transform group-hover:translate-x-0.5" :stroke-width="2" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div v-else class="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
      <ul class="lg:col-span-8" aria-label="Позиции заявки">
        <li
          v-for="item in items"
          :key="item.key"
          class="grid gap-4 border-b border-border py-6 first:border-t sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8"
        >
          <div class="min-w-0">
            <p class="eyebrow">{{ findService(item.service)?.title }}</p>
            <h2 class="mt-2 font-display text-[1.75rem] leading-tight">{{ item.title }}</h2>
            <p v-if="item.subtitle" class="mt-1 text-sm text-muted">{{ item.subtitle }}</p>
            <ul v-if="item.details.length" class="mt-3 flex flex-wrap gap-1.5">
              <li v-for="detail in item.details" :key="detail" class="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium">
                {{ detail }}
              </li>
            </ul>
            <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
              <button
                v-if="editorFor(item)"
                type="button"
                class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-[6px] hover:underline"
                :aria-label="`Изменить: ${item.title}`"
                @click="editorFor(item)!()"
              >
                <Pencil class="size-4" :stroke-width="1.75" aria-hidden="true" />
                Изменить
              </button>
              <NuxtLink
                v-else-if="item.href"
                :to="item.href"
                class="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-[6px] hover:underline"
              >
                Страница услуги
              </NuxtLink>
              <button
                type="button"
                class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-error"
                :aria-label="`Удалить из заявки: ${item.title}`"
                @click="remove(item.key)"
              >
                <Trash2 class="size-4" :stroke-width="1.75" aria-hidden="true" />
                Удалить
              </button>
            </div>
          </div>
          <p class="flex flex-col sm:items-end sm:text-right">
            <span class="text-lg font-semibold tabular-nums">{{ priceText(item.price, item.pricePartial) }}</span>
            <span v-if="item.price !== null && item.priceIsDemo" class="text-xs text-muted">демо-цена</span>
            <span v-if="item.quantity > 1" class="text-xs text-muted">× {{ item.quantity }}</span>
          </p>
        </li>
      </ul>

      <aside class="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:col-span-4 lg:self-start">
        <div class="rounded-card bg-surface p-6 shadow-(--shadow-soft)">
          <p class="text-sm text-muted">{{ positions(items.length) }}</p>
          <p class="mt-2 flex flex-col">
            <span class="text-xs text-muted">Известная стоимость</span>
            <span class="text-[1.75rem] leading-tight font-semibold tabular-nums">
              {{ total.hasKnown ? formatRub(total.known) : 'Обсуждается' }}
            </span>
          </p>
          <p v-if="total.hasKnown && total.hasOnRequest" class="mt-1 text-sm text-muted">+ позиции с индивидуальным расчётом</p>
          <p v-if="total.hasDemo" class="mt-1 text-xs text-muted">Включает демо-цены — итог уточним при согласовании.</p>

          <BaseButton :to="primaryCta.to" size="lg" block class="mt-6">
            Оформить заявку
            <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
          </BaseButton>

          <div class="mt-5 flex gap-3 text-xs leading-relaxed text-muted">
            <Info class="mt-0.5 size-4 shrink-0" :stroke-width="1.75" aria-hidden="true" />
            <p>
              Дату, время и место мероприятия укажете один раз для всей заявки. Отправка заявки не означает бронирования —
              мы свяжемся с вами и подтвердим заказ вручную.
            </p>
          </div>
        </div>

        <BaseButton to="/" variant="ghost" class="mt-4">
          <ArrowLeft class="size-4" :stroke-width="1.75" aria-hidden="true" />
          Продолжить выбор услуг
        </BaseButton>
      </aside>
    </div>

    <!-- Editors of positions, in their service's look (the theme class re-points the accent colour). -->
    <div class="theme-photozones">
      <PhotozoneDetailsDialog mode="edit" />
    </div>
  </section>
</template>
