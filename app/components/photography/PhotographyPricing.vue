<script setup lang="ts">
import { ArrowRight, Check, Plus } from '@lucide/vue'
import { formatRub } from '~/composables/usePhotobookPrice'
import { photographyExtras, photographyPackages, type PhotographyPackage } from '~/config/photography'
import { photographyDirections } from '~/lib/selection'

/*
 * Pricing: packages are the main offer; add-ons and the individual request are deliberately
 * quieter. The choice becomes the photography position of «Моя подборка»:
 *   «Отправить заявку» — sync it and open the request form;
 *   «Добавить к общей заявке» — add it and stay on the page.
 * Values that are `null` in config are never shown as numbers.
 */

const { selection, hasSelection, inSelection, selectPackage, toggleExtra, addToSelection, submit, reset } = usePhotographyOrder()
const { openDrawer } = useSelection()

const extras = photographyExtras.filter((extra) => extra.available)

/** «Обсудить индивидуальную съёмку»: marks the individual-terms add-on and goes to the summary. */
function chooseCustom() {
  if (!selection.value.extras.includes('custom-terms')) toggleExtra('custom-terms')
  document.getElementById('pricing-summary')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const priceLabel = (price: number | null) => (price === null ? 'По запросу' : formatRub(price))

function hoursLabel(hours: number) {
  const word = hours % 10 === 1 && hours % 100 !== 11 ? 'часа' : 'часов'
  return `До ${hours} ${word} съёмки`
}

function packageLines(pkg: PhotographyPackage): string[] {
  return [
    hoursLabel(pkg.durationHours),
    ...(pkg.photos ? [`От ${pkg.photos} обработанных фотографий`] : []),
    ...pkg.includes,
    pkg.deliveryDays ? `Готовность — до ${pkg.deliveryDays} дней` : 'Срок готовности фиксируем при бронировании',
  ]
}

const summary = computed(() => {
  const pkg = photographyPackages.find((p) => p.id === selection.value.package)
  const direction = photographyDirections.find((d) => d.id === selection.value.direction)
  return [
    direction && direction.label,
    pkg && `${pkg.name} — ${pkg.title}`,
    ...extras.filter((e) => selection.value.extras.includes(e.id)).map((e) => e.title),
  ].filter((line): line is string => Boolean(line))
})
</script>

<template>
  <section id="pricing" class="section-y bg-surface" aria-labelledby="pricing-title">
    <div class="container-page">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading v-reveal eyebrow="04 / Pricing" title="Выберите свой формат." heading-id="pricing-title" />
        <p v-reveal="80" class="max-w-sm text-[0.9375rem] leading-relaxed text-muted">
          Подберём продолжительность и формат съёмки под ваши задачи.
        </p>
      </div>

      <!-- ---------- Packages (one structure for all three) ---------- -->
      <ul class="mt-12 grid gap-4 md:mt-14 lg:grid-cols-3 lg:gap-5">
        <li v-for="(pkg, index) in photographyPackages" :key="pkg.id" v-reveal="index * 100">
          <article
            class="flex h-full flex-col rounded-input border p-6 transition-[border-color,box-shadow] duration-(--motion-normal) ease-standard sm:p-7"
            :class="
              selection.package === pkg.id
                ? 'border-text shadow-[inset_0_0_0_1px_var(--color-text)]'
                : pkg.recommended
                  ? 'border-accent/50 bg-bg'
                  : 'border-border'
            "
            :aria-labelledby="`package-${pkg.id}`"
          >
            <div class="flex min-h-6 items-center justify-between gap-4">
              <p class="eyebrow">{{ pkg.name }}</p>
              <span v-if="pkg.recommended" class="rounded-full bg-accent-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-accent">
                Рекомендуем
              </span>
            </div>
            <h3 :id="`package-${pkg.id}`" class="mt-3 font-display text-[2rem] leading-none">{{ pkg.title }}</h3>

            <p class="mt-6 border-t border-border pt-5">
              <span class="block text-xl font-semibold tracking-[-0.01em] tabular-nums">{{ priceLabel(pkg.price) }}</span>
              <span v-if="pkg.price === null" class="mt-1 block text-xs text-muted">Рассчитаем под дату и формат</span>
            </p>

            <ul class="mt-5 flex flex-1 flex-col gap-2.5 text-[0.9375rem]">
              <li v-for="line in packageLines(pkg)" :key="line" class="flex gap-3">
                <Check class="mt-1 size-4 shrink-0 text-accent" :stroke-width="2" aria-hidden="true" />
                {{ line }}
              </li>
            </ul>

            <button
              type="button"
              class="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-button text-sm font-semibold transition-[background-color,color,box-shadow,scale] duration-(--motion-normal) ease-standard active:scale-[0.98]"
              :class="
                selection.package === pkg.id
                  ? 'bg-text text-bg'
                  : 'text-text ring-1 ring-text/25 ring-inset hover:ring-text'
              "
              :aria-pressed="selection.package === pkg.id"
              @click="selectPackage(selection.package === pkg.id ? null : pkg.id)"
            >
              <Check v-if="selection.package === pkg.id" class="size-4" :stroke-width="2" aria-hidden="true" />
              {{ selection.package === pkg.id ? 'Пакет выбран' : 'Выбрать пакет' }}
            </button>
          </article>
        </li>
      </ul>

      <!-- ---------- Add-ons, other services, summary ---------- -->
      <div class="mt-12 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-8">
        <div class="flex flex-col gap-10 lg:col-span-7">
          <fieldset v-reveal>
            <legend class="eyebrow text-text">Дополнительно</legend>
            <ul class="mt-4 border-t border-border">
              <li v-for="extra in extras" :key="extra.id" class="border-b border-border">
                <label class="group flex min-h-14 cursor-pointer items-center gap-4 py-3.5 has-focus-visible:outline-2 has-focus-visible:outline-accent">
                  <input
                    type="checkbox"
                    class="sr-only"
                    :checked="selection.extras.includes(extra.id)"
                    @change="toggleExtra(extra.id)"
                  >
                  <span
                    class="inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-(--motion-normal)"
                    :class="
                      selection.extras.includes(extra.id)
                        ? 'border-accent bg-accent text-white'
                        : 'border-border text-muted-soft group-hover:border-text/40'
                    "
                    aria-hidden="true"
                  >
                    <Check v-if="selection.extras.includes(extra.id)" class="size-3.5" :stroke-width="2.5" />
                    <Plus v-else class="size-3.5" :stroke-width="2" />
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <span class="font-semibold">{{ extra.title }}</span>
                    <span class="text-sm text-muted">{{ extra.description }}</span>
                  </span>
                  <span class="shrink-0 text-sm text-muted tabular-nums">{{ priceLabel(extra.price) }}</span>
                </label>
              </li>
            </ul>
          </fieldset>

          <div v-reveal>
            <p class="eyebrow text-text">Объединить в одной заявке</p>
            <p class="mt-3 text-sm text-muted">
              Фотобудку, фотозоны и фотокниги можно добавить в ту же подборку на их страницах — одна заявка и одно
              согласование для всех услуг на вашем событии.
            </p>
          </div>
        </div>

        <aside id="pricing-summary" v-reveal="120" class="lg:col-span-4 lg:col-start-9" aria-labelledby="pricing-summary-title">
          <div class="rounded-input bg-bg p-6 sm:p-7">
            <h3 id="pricing-summary-title" class="eyebrow text-text">Ваш выбор</h3>
            <ul v-if="summary.length" class="mt-4 flex flex-col gap-2 text-[0.9375rem]" aria-live="polite">
              <li v-for="line in summary" :key="line" class="flex gap-3">
                <span class="mt-2.5 h-px w-3 shrink-0 bg-text" aria-hidden="true" />
                {{ line }}
              </li>
            </ul>
            <p v-else class="mt-4 text-[0.9375rem] text-muted" aria-live="polite">Выберите пакет и дополнительные услуги.</p>

            <BaseButton size="lg" block class="mt-6" @click="submit">
              Отправить заявку
              <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
            </BaseButton>
            <BaseButton variant="secondary" size="lg" block class="mt-2" @click="addToSelection">
              <Plus class="size-4" :stroke-width="2" aria-hidden="true" />
              Добавить к общей заявке
            </BaseButton>
            <button
              v-if="inSelection"
              type="button"
              class="mt-1 min-h-11 w-full text-sm font-semibold underline-offset-4 hover:underline"
              @click="openDrawer"
            >
              Фотосъёмка в подборке — открыть
            </button>
            <button
              v-if="hasSelection"
              type="button"
              class="mt-1 min-h-11 w-full text-sm text-muted underline-offset-4 hover:text-text hover:underline"
              @click="reset"
            >
              Сбросить выбор
            </button>
            <p class="mt-4 text-xs leading-relaxed text-muted">
              Стоимость и дату подтверждаем вручную после обсуждения — до этого дата не считается забронированной.
            </p>
          </div>
        </aside>
      </div>

      <!-- ---------- Individual offer ---------- -->
      <div
        v-reveal
        class="mt-12 flex flex-col gap-6 border-t border-border pt-10 md:mt-14 md:flex-row md:items-center md:justify-between md:gap-10"
      >
        <div>
          <h3 class="font-display text-h3">Не нашли подходящий формат?</h3>
          <p class="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
            Расскажите о своей идее — мы подготовим индивидуальное предложение.
          </p>
        </div>
        <BaseButton variant="secondary" size="lg" class="w-full md:w-auto" @click="chooseCustom">
          Обсудить индивидуальную съёмку
          <template #icon><ArrowRight class="size-4" :stroke-width="2" /></template>
        </BaseButton>
      </div>
    </div>
  </section>
</template>
