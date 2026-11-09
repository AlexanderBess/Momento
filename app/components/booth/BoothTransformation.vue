<script setup lang="ts">
import { transformationExamples } from '~/config/booth'

const activeId = ref(transformationExamples[0]!.id)
const active = computed(() => transformationExamples.find((e) => e.id === activeId.value)!)

const stage = useTemplateRef<HTMLDivElement>('stage')
const { isInView } = useInView(stage, { once: true, threshold: 0.5 })
const { fullMotion } = useMotionLevel()
// One hint movement the first time the slider is half on screen — never for reduced motion / low-end.
const demo = computed(() => isInView.value && fullMotion.value)
</script>

<template>
  <section id="transformation" class="section-y bg-surface" aria-labelledby="transformation-title">
    <div class="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
      <div class="flex flex-col gap-8">
        <SectionHeading
          v-reveal
          eyebrow="AI-преображение"
          title="Один снимок — новый образ"
          heading-id="transformation-title"
          lead="Фотобудка делает обычный портрет гостя, а нейросеть превращает его в изображение в выбранном стиле. Передвиньте разделитель, чтобы сравнить."
        />

        <div v-reveal="120" class="flex flex-col gap-3">
          <p id="transformation-examples-label" class="eyebrow">Примеры</p>
          <div class="flex flex-wrap gap-2" role="group" aria-labelledby="transformation-examples-label">
            <button
              v-for="example in transformationExamples"
              :key="example.id"
              type="button"
              class="inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-[background-color,border-color,color] duration-(--motion-normal) ease-standard"
              :class="
                example.id === activeId
                  ? 'border-text bg-text text-bg'
                  : 'border-border bg-bg text-text hover:border-text/40'
              "
              :aria-pressed="example.id === activeId"
              @click="activeId = example.id"
            >
              {{ example.label }}
            </button>
          </div>
        </div>
      </div>

      <div ref="stage" class="mx-auto w-full max-w-[34rem] lg:mr-0">
        <ClipReveal>
          <!-- Crossfade between examples; the frame keeps its size, so nothing jumps. -->
          <div class="grid">
            <Transition name="ba-fade">
              <BeforeAfterSlider
                :key="active.id"
                class="[grid-area:1/1]"
                :before="active.before"
                :after="active.after"
                :demo="demo"
                sizes="(min-width: 1024px) 544px, 100vw"
              />
            </Transition>
          </div>
        </ClipReveal>
        <p class="mt-4 text-center text-sm text-muted">
          Демонстрационные примеры. Набор образов подбирается под ваше мероприятие.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ba-fade-enter-active,
.ba-fade-leave-active {
  transition: opacity var(--motion-slow) var(--ease-standard);
}

.ba-fade-enter-from,
.ba-fade-leave-to {
  opacity: 0;
}
</style>
