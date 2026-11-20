<script setup lang="ts">
import { ArrowRight, Check, Minus, Plus } from '@lucide/vue'
import { photobookPricing } from '~/config/photobook/pricing'

/**
 * Price + quantity + the order actions. `panel` — full block with the breakdown (studio sidebar),
 * `bar` — one line for the sticky mobile bar.
 *
 *   «Добавить в заказ» — puts this book into «Моя подборка» and stays in the studio;
 *   «Оформить заказ»   — adds / syncs this book and opens the request form.
 * Saving the project alone never adds the book. Once added, the position follows every save.
 */
withDefaults(defineProps<{ variant?: 'panel' | 'bar' }>(), { variant: 'panel' })

const { config, setQuantity } = usePhotobookStudio()
const project = usePhotobookProject()
const { notify, goToCheckout, openDrawer } = useSelection()
const price = usePhotobookPrice()
const uid = useId()

const bookLabel = computed(() =>
  config.value.coverTitleEnabled && config.value.coverTitle.trim() ? `Фотокнига «${config.value.coverTitle.trim()}»` : 'Фотокнига',
)

function add() {
  const result = project.addToSelection()
  if (result === 'conflict' || result === 'needs-replace') return
  notify(result, bookLabel.value)
}

async function checkout() {
  const result = project.addToSelection()
  if (result === 'conflict') return
  await goToCheckout()
}
</script>

<template>
  <!-- ---------- Sticky bar (mobile) ---------- -->
  <div v-if="variant === 'bar'" class="flex items-center gap-3">
    <p class="flex min-w-0 flex-1 flex-col">
      <template v-if="price.mode === 'estimate'">
        <span class="truncate text-[0.6875rem] font-semibold tracking-[0.08em] text-muted uppercase">
          {{ price.isDemo ? 'Примерно · демо' : 'Примерно' }}{{ price.quantity > 1 ? ` · ${price.quantity} шт.` : '' }}
        </span>
        <span class="text-lg font-semibold tabular-nums">{{ formatRub(price.total) }}</span>
      </template>
      <template v-else>
        <span class="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted uppercase">Стоимость</span>
        <span class="text-sm font-semibold">обсуждается</span>
      </template>
    </p>
    <button
      type="button"
      class="stepper-button"
      :class="project.inSelection.value && 'border-success! text-success'"
      :aria-label="project.inSelection.value ? 'Книга в подборке — обновить' : 'Добавить в заказ'"
      @click="add"
    >
      <component :is="project.inSelection.value ? Check : Plus" class="size-5" :stroke-width="2" aria-hidden="true" />
    </button>
    <BaseButton @click="checkout">Оформить заказ</BaseButton>
  </div>

  <!-- ---------- Panel ---------- -->
  <div v-else class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4">
      <span :id="`${uid}-qty`" class="text-sm font-semibold">Экземпляров</span>
      <div class="flex items-center gap-2" role="group" :aria-labelledby="`${uid}-qty`">
        <button
          type="button"
          class="stepper-button size-10!"
          :disabled="config.quantity <= 1"
          aria-label="Меньше экземпляров"
          @click="setQuantity(config.quantity - 1)"
        >
          <Minus class="size-4" :stroke-width="2" aria-hidden="true" />
        </button>
        <span class="w-8 text-center text-base font-semibold tabular-nums" aria-live="polite">{{ config.quantity }}</span>
        <button
          type="button"
          class="stepper-button size-10!"
          :disabled="config.quantity >= photobookPricing.maxQuantity"
          aria-label="Больше экземпляров"
          @click="setQuantity(config.quantity + 1)"
        >
          <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="rounded-card bg-surface p-4 ring-1 ring-border">
      <template v-if="price.mode === 'estimate'">
        <div class="flex items-end justify-between gap-4">
          <p class="flex flex-col">
            <span class="text-xs font-semibold text-muted">Предварительная стоимость</span>
            <span class="mt-1 text-[1.75rem] leading-none font-semibold tracking-[-0.01em] tabular-nums" aria-live="polite">{{ formatRub(price.total) }}</span>
          </p>
          <span v-if="price.quantity > 1" class="pb-1 text-xs text-muted tabular-nums">
            {{ formatRub(price.unit) }} × {{ price.quantity }}
          </span>
        </div>

        <details class="group/price mt-3">
          <summary
            class="inline-flex min-h-8 cursor-pointer list-none items-center text-xs font-semibold text-accent underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden"
          >
            <span class="group-open/price:hidden">Из чего складывается</span>
            <span class="hidden group-open/price:inline">Скрыть расчёт</span>
          </summary>
          <dl class="mt-2 flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
            <div v-for="line in price.lines" :key="line.label" class="flex justify-between gap-4">
              <dt class="text-muted">{{ line.label }}</dt>
              <dd class="font-semibold tabular-nums">{{ formatRub(line.amount) }}</dd>
            </div>
          </dl>
        </details>

        <p v-if="price.isDemo" class="mt-3 flex gap-2 text-[0.6875rem] leading-snug text-muted">
          <span class="mt-1 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
          <span>
            <strong class="font-semibold text-text">Демо-расчёт</strong> по примерным ценам, не является офертой. Точную
            стоимость назовём после согласования макета.
          </span>
        </p>
      </template>

      <template v-else>
        <p class="text-xs font-semibold text-muted">Стоимость</p>
        <p class="mt-1 font-display text-[1.75rem] leading-tight">Обсуждается</p>
        <p class="mt-2 text-xs leading-snug text-muted">Рассчитаем индивидуально по вашей конфигурации.</p>
      </template>
    </div>

    <label class="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        class="mt-0.5 size-5 shrink-0 accent-(--color-accent)"
        :checked="project.layoutComplete.value"
        @change="project.setLayoutComplete(($event.target as HTMLInputElement).checked)"
      >
      <span>
        <span class="font-semibold">Макет готов к согласованию</span>
        <span class="mt-0.5 block text-xs text-muted">Можно оформить и незавершённый макет — доработаем его вместе.</span>
      </span>
    </label>

    <div class="flex flex-col gap-2">
      <BaseButton size="lg" block @click="checkout">
        Оформить заказ
        <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
      </BaseButton>
      <BaseButton size="lg" variant="secondary" block @click="add">
        <component :is="project.inSelection.value ? Check : Plus" class="size-4" :stroke-width="2" aria-hidden="true" />
        {{ project.inSelection.value ? 'Книга в заказе' : 'Добавить в заказ' }}
      </BaseButton>
      <button
        v-if="project.inSelection.value"
        type="button"
        class="min-h-11 text-sm font-semibold underline-offset-4 hover:underline"
        @click="openDrawer"
      >
        Открыть подборку
      </button>
    </div>
  </div>
</template>
