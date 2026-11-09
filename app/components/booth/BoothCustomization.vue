<script setup lang="ts">
import { boothCustomization } from '~/config/booth'

/**
 * Tabs (WAI-ARIA pattern): ←/→/Home/End move between options, the image crossfades.
 * Mobile: horizontal scrollable tab row above the image. Desktop: vertical list beside it.
 */
const activeIndex = ref(0)
const active = computed(() => boothCustomization[activeIndex.value]!)
const tabs = useTemplateRef<HTMLButtonElement[]>('tabs')

function onKeydown(event: KeyboardEvent) {
  const last = boothCustomization.length - 1
  const map: Record<string, number> = {
    ArrowRight: activeIndex.value === last ? 0 : activeIndex.value + 1,
    ArrowDown: activeIndex.value === last ? 0 : activeIndex.value + 1,
    ArrowLeft: activeIndex.value === 0 ? last : activeIndex.value - 1,
    ArrowUp: activeIndex.value === 0 ? last : activeIndex.value - 1,
    Home: 0,
    End: last,
  }
  const next = map[event.key]
  if (next === undefined) return
  event.preventDefault()
  activeIndex.value = next
  tabs.value?.[next]?.focus()
}
</script>

<template>
  <section id="customization" class="section-y clip-x" aria-labelledby="customization-title">
    <div class="container-page">
      <SectionHeading
        v-reveal
        eyebrow="Оформление"
        title="Фотобудка в стиле вашего события"
        heading-id="customization-title"
        lead="Внешний вид меняется сменными панелями — от праздничного декора до фирменного стиля компании."
      />

      <div class="mt-10 grid gap-8 md:mt-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div
          v-reveal="80"
          role="tablist"
          aria-label="Варианты оформления"
          aria-orientation="vertical"
          class="no-scrollbar -mx-(--gutter) flex gap-2 overflow-x-auto px-(--gutter) lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-border lg:px-0"
          @keydown="onKeydown"
        >
          <button
            v-for="(option, index) in boothCustomization"
            :id="`custom-tab-${option.id}`"
            ref="tabs"
            :key="option.id"
            type="button"
            role="tab"
            :aria-selected="index === activeIndex"
            :aria-controls="`custom-panel`"
            :tabindex="index === activeIndex ? 0 : -1"
            class="group shrink-0 text-left transition-colors duration-(--motion-normal) ease-standard max-lg:inline-flex max-lg:min-h-11 max-lg:items-center max-lg:rounded-full max-lg:border max-lg:px-5 max-lg:text-sm max-lg:font-semibold lg:flex lg:items-start lg:gap-5 lg:border-b lg:border-border lg:py-6"
            :class="
              index === activeIndex
                ? 'max-lg:border-text max-lg:bg-text max-lg:text-bg'
                : 'max-lg:border-border max-lg:bg-surface max-lg:hover:border-text/40'
            "
            @click="activeIndex = index"
          >
            <span
              class="hidden font-display text-xl transition-colors duration-(--motion-normal) lg:block"
              :class="index === activeIndex ? 'text-accent' : 'text-muted'"
              aria-hidden="true"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="flex flex-col gap-2">
              <span
                class="lg:font-display lg:text-h3 lg:transition-colors lg:duration-(--motion-normal)"
                :class="index === activeIndex ? 'lg:text-text' : 'lg:text-text/55 lg:group-hover:text-text'"
              >
                {{ option.label }}
              </span>
              <!-- Description stays in the tab on desktop only for the active option. -->
              <span v-if="index === activeIndex" class="hidden max-w-md text-[0.9375rem] leading-relaxed text-muted lg:block">
                {{ option.text }}
              </span>
            </span>
          </button>
        </div>

        <div id="custom-panel" role="tabpanel" :aria-labelledby="`custom-tab-${active.id}`" tabindex="0" class="rounded-card">
          <ClipReveal>
            <div class="grid">
              <Transition name="custom-fade">
                <PhotoFrame
                  :key="active.id"
                  :image="active.image"
                  ratio="4 / 3"
                  zoom-on-hover
                  class="group [grid-area:1/1]"
                  sizes="(min-width: 1024px) 620px, 100vw"
                />
              </Transition>
            </div>
          </ClipReveal>
          <p class="mt-5 text-[0.9375rem] leading-relaxed text-muted lg:hidden">{{ active.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-fade-enter-active,
.custom-fade-leave-active {
  transition: opacity var(--motion-slow) var(--ease-standard);
}

.custom-fade-enter-from,
.custom-fade-leave-to {
  opacity: 0;
}
</style>
