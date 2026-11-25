<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import type { CartItem } from '~/types/cart'
import { findService } from '~/config/services'
import { priceText } from '~/lib/selection'
import { INDIVIDUAL_PHOTOBOOK_ORDER, isPersonalPhotobookOrder } from '#shared/photobookGuide'
import { GRADUATION_PHOTOBOOK_ORDER } from '#shared/graduationPhotobook'
import { findGraduationTemplate } from '~/config/photobook/graduation'

/** One position of «Моя подборка» — the same card in the drawer and on /checkout. */
const props = withDefaults(defineProps<{ item: CartItem; compact?: boolean; highlight?: boolean }>(), {
  compact: false,
  highlight: false,
})
defineEmits<{ edit: []; remove: [] }>()

const service = computed(() => findService(props.item.service)?.title)
const isPersonalBook = computed(() => props.item.service === 'photobooks' && isPersonalPhotobookOrder(props.item.config.orderType))
const isIndividualBook = computed(() => isPersonalBook.value && props.item.config.orderType === INDIVIDUAL_PHOTOBOOK_ORDER)
const isGraduation = computed(() => props.item.service === 'photobooks' && props.item.config.orderType === GRADUATION_PHOTOBOOK_ORDER)
const unavailableTemplate = computed(() => isGraduation.value && !findGraduationTemplate(props.item.config.templateId)?.enabled)
const itemLabel = computed(() => [props.item.title, ...((isIndividualBook.value || isGraduation.value) ? props.item.details : [])].join(', '))
const { closeDrawer } = useSelection()
</script>

<template>
  <article
    class="grid gap-3 rounded-card bg-surface p-4 ring-1 transition-[box-shadow] duration-(--motion-slow) sm:p-5"
    :class="highlight ? 'ring-2 ring-accent' : 'ring-border'"
    :aria-label="itemLabel"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="eyebrow">{{ service }}</p>
        <h3 class="mt-1.5 font-display leading-tight break-words" :class="compact ? 'text-[1.375rem]' : 'text-[1.625rem]'">
          {{ item.title }}
        </h3>
        <p v-if="item.subtitle" class="mt-1 text-sm text-muted">{{ item.subtitle }}</p>
      </div>
      <p class="flex shrink-0 flex-col items-end text-right" :class="item.service === 'photobooks' && 'max-w-[9rem]'">
        <span class="text-[0.9375rem] font-semibold tabular-nums">{{ priceText(item) }}</span>
        <span v-if="item.price !== null && item.priceIsDemo" class="text-xs text-muted">демо-цена</span>
        <span v-if="item.quantity > 1" class="text-xs text-muted tabular-nums">× {{ item.quantity }} шт.</span>
      </p>
    </div>

    <ul v-if="item.details.length" class="flex flex-wrap gap-1.5" aria-label="Параметры">
      <li v-for="detail in item.details" :key="detail" class="max-w-full rounded-full bg-surface-muted px-3 py-1 text-xs font-medium break-words">
        {{ detail }}
      </li>
    </ul>

    <p v-if="unavailableTemplate" class="text-sm text-muted">Для отправки заявки замените снятый с выбора шаблон.</p>

    <p v-if="item.status" class="inline-flex items-center gap-2 text-xs font-semibold">
      <span
        class="size-2 shrink-0 rounded-full"
        :class="item.status === 'Макет готов' ? 'bg-success' : 'bg-warning'"
        aria-hidden="true"
      />
      {{ item.status }}
    </p>

    <div class="-mb-2 flex flex-wrap items-center gap-x-5">
      <button
        type="button"
        class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-[6px] hover:underline"
        :aria-label="`Изменить: ${itemLabel}`"
        @click="$emit('edit')"
      >
        <Pencil class="size-4" :stroke-width="1.75" aria-hidden="true" />
        Изменить
      </button>
      <button
        type="button"
        class="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-error"
        :aria-label="`Удалить из подборки: ${itemLabel}`"
        @click="$emit('remove')"
      >
        <Trash2 class="size-4" :stroke-width="1.75" aria-hidden="true" />
        Удалить
      </button>
      <NuxtLink
        v-if="(isPersonalBook || isGraduation) && item.href"
        :to="item.href"
        class="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-[6px] hover:underline"
        @click="closeDrawer"
      >
        {{ isGraduation ? 'К расчёту тиража' : isIndividualBook ? 'К выбору параметров' : 'К коллекциям' }}
      </NuxtLink>
    </div>
  </article>
</template>
