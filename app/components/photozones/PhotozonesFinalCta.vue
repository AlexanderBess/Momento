<script setup lang="ts">
import { ArrowDown, ArrowRight, ShoppingBag, Sparkles } from '@lucide/vue'
import { photozonesFinalCta } from '~/config/photozones'
import { cartLink } from '~/config/navigation'

/*
 * Closing block on the sage mist tint. «Добавить в заявку» uses the visitor's current choice on
 * the page (a concept opened in the catalogue with its options, or the individual project).
 * Without a choice it asks which one — nothing undefined is ever added silently.
 */
const { selection, selectionLabel, addSelection, addCustom } = usePhotozoneOrder()
const { count, ready } = useCart()

const chooserOpen = ref(false)

function onAdd() {
  if (!selection.value) {
    chooserOpen.value = true
    return
  }
  addSelection()
}

function chooseReady() {
  chooserOpen.value = false
  // The dialog releases the page scroll lock in its (async) `close` event — scroll after that.
  setTimeout(() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
}

function chooseCustom() {
  chooserOpen.value = false
  addCustom()
}
</script>

<template>
  <section id="photozones-cta" class="px-2 pb-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4" aria-labelledby="pz-cta-title">
    <div class="overflow-hidden rounded-[1.5rem] bg-service-bg sm:rounded-[1.75rem]">
      <div class="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-12">
        <ClipReveal class="lg:col-span-6">
          <PhotozoneVisual :asset="photozonesFinalCta.visual" ratio="4 / 3" sizes="720px lg:600px" />
        </ClipReveal>

        <div class="flex flex-col lg:col-span-6">
          <p v-reveal class="eyebrow text-(--color-accent)">07 / Ваша заявка</p>
          <h2 id="pz-cta-title" v-reveal="60" class="mt-5 font-display text-[clamp(2.5rem,1.6rem+4vw,4.75rem)] leading-[0.98] tracking-[-0.015em]">
            Создадим пространство <em class="italic">для ваших моментов</em>
          </h2>
          <p v-reveal="100" class="mt-6 max-w-md text-lead text-muted">
            Выберите готовую фотозону или расскажите о своей идее. Мы обсудим детали и подготовим предложение.
          </p>

          <div v-reveal="140" class="mt-9 flex flex-col gap-4">
            <p v-if="selectionLabel" class="text-sm" aria-live="polite">
              <span class="text-muted">Ваш выбор:</span> <span class="font-semibold">{{ selectionLabel }}</span>
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <BaseButton size="lg" class="w-full sm:w-auto" @click="onAdd">
                <ShoppingBag class="size-4" :stroke-width="2" aria-hidden="true" />
                Добавить в заявку
              </BaseButton>
              <NuxtLink
                v-if="ready && count"
                :to="cartLink.to"
                class="group inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold underline-offset-[6px] hover:underline"
              >
                Перейти в корзину
                <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" :stroke-width="2" aria-hidden="true" />
              </NuxtLink>
              <NuxtLink
                v-else-if="selection"
                to="#collection"
                class="inline-flex min-h-11 items-center justify-center text-sm font-semibold underline-offset-[6px] hover:underline"
              >
                Изменить выбор
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Asked only when nothing is chosen yet. -->
    <BaseDialog v-model:open="chooserOpen" title="Что добавить в заявку?">
      <p class="text-[0.9375rem] text-muted">Выберите готовую фотозону из коллекции или индивидуальный проект.</p>
      <div class="mt-6 grid gap-3">
        <button type="button" class="option-card flex items-center gap-4 p-4 text-left" @click="chooseReady">
          <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-service-bg text-(--color-accent)" aria-hidden="true">
            <ArrowDown class="size-5" :stroke-width="1.5" />
          </span>
          <span class="flex flex-col">
            <span class="font-semibold">Выбрать готовую фотозону</span>
            <span class="text-sm text-muted">Перейти к коллекции и выбрать концепцию</span>
          </span>
        </button>
        <button type="button" class="option-card flex items-center gap-4 p-4 text-left" @click="chooseCustom">
          <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-service-bg text-(--color-accent)" aria-hidden="true">
            <Sparkles class="size-5" :stroke-width="1.5" />
          </span>
          <span class="flex flex-col">
            <span class="font-semibold">Добавить индивидуальный проект</span>
            <span class="text-sm text-muted">Стоимость обсуждается — подготовим предложение</span>
          </span>
        </button>
      </div>
    </BaseDialog>
  </section>
</template>
