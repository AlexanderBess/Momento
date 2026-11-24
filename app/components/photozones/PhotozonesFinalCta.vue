<script setup lang="ts">
import { ArrowDown, ArrowRight, Plus, Sparkles } from '@lucide/vue'
import { hasPhotozoneConcepts, photozonesFinalCta } from '~/config/photozones'

/*
 * Closing block on the sage mist tint. Both actions use the visitor's current choice on the page
 * (a concept opened in the catalogue with its options, or the individual project):
 * The primary action syncs the choice and opens the request form; the secondary action stays here.
 * Without a choice, ask what to add. If a photozone is already in the selection, checkout can open directly.
 */
const { selection, selectionLabel, selectionItem, addCustom, submitCustom } = usePhotozoneOrder()
const { items } = useCart()
const { addToSelection, submitWith, goToCheckout } = useSelection()

const chooserOpen = ref(false)
const pendingAction = ref<'add' | 'submit'>('add')

function onAdd() {
  const current = selectionItem()
  if (!current) {
    pendingAction.value = 'add'
    chooserOpen.value = true
    return
  }
  addToSelection(current.item, current.label)
}

function onSubmit() {
  const current = selectionItem()
  if (current) {
    submitWith(current.item)
    return
  }
  if (items.value.some((i) => i.service === 'photozones')) {
    goToCheckout()
    return
  }
  pendingAction.value = 'submit'
  chooserOpen.value = true
}

function chooseCustom() {
  chooserOpen.value = false
  if (pendingAction.value === 'submit') submitCustom()
  else addCustom()
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
            {{ hasPhotozoneConcepts ? 'Выберите готовую фотозону или расскажите о своей идее.' : 'Расскажите о своей идее.' }}
            Мы обсудим детали и подготовим предложение.
          </p>

          <div v-reveal="140" class="mt-9 flex flex-col gap-4">
            <p v-if="selectionLabel" class="text-sm" aria-live="polite">
              <span class="text-muted">Ваш выбор:</span> <span class="font-semibold">{{ selectionLabel }}</span>
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <BaseButton size="lg" class="w-full sm:w-auto" @click="onSubmit">
                К оформлению заявки
                <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
              </BaseButton>
              <BaseButton size="lg" variant="secondary" class="w-full sm:w-auto" @click="onAdd">
                <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
                Добавить в подборку
              </BaseButton>
            </div>
            <NuxtLink
              v-if="selection"
              :to="selection.type === 'ready' ? '#collection' : '#custom'"
              class="inline-flex min-h-11 items-center self-start text-sm font-semibold underline-offset-[6px] hover:underline"
            >
              Изменить выбор
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Asked only when nothing is chosen yet. -->
    <BaseDialog v-model:open="chooserOpen" title="Какую фотозону выбрать?">
      <p v-if="hasPhotozoneConcepts" class="text-[0.9375rem] text-muted">Выберите готовую фотозону из коллекции или индивидуальный проект.</p>
      <div class="mt-6 grid gap-3">
        <NuxtLink v-if="hasPhotozoneConcepts" to="#collection" class="option-card flex items-center gap-4 p-4 text-left" @click="chooserOpen = false">
          <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-service-bg text-(--color-accent)" aria-hidden="true">
            <ArrowDown class="size-5" :stroke-width="1.5" />
          </span>
          <span class="flex flex-col">
            <span class="font-semibold">Выбрать готовую фотозону</span>
            <span class="text-sm text-muted">Перейти к коллекции и выбрать концепцию</span>
          </span>
        </NuxtLink>
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
