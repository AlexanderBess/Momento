<script setup lang="ts">
/** Four steps from the studio to production — an editorial sequence, not a corporate flowchart. */
const steps = [
  {
    title: 'Вы выбираете параметры',
    text: 'Формат, объём, обложка и бумага — в конструкторе на этой странице, без спешки.',
  },
  {
    title: 'Настраиваете обложку и развороты',
    text: 'Название, цвета, макет каждого разворота. Конфигурация уходит к нам вместе с заявкой.',
  },
  {
    title: 'Мы согласовываем макет',
    text: 'Подбираем ваши фотографии под выбранную вёрстку и обсуждаем все детали с вами.',
  },
  {
    title: 'Книга отправляется в производство',
    text: 'Только после того, как вы утвердите макет.',
  },
]
</script>

<template>
  <section class="section-y bg-surface" aria-labelledby="process-title">
    <div class="container-page">
      <SectionHeading v-reveal eyebrow="Как это происходит" title="От идеи до книги в руках" heading-id="process-title" />

      <ol class="mt-12 grid gap-10 md:grid-cols-2 md:gap-x-10 lg:mt-16 lg:grid-cols-4 lg:gap-8">
        <li v-for="(step, index) in steps" :key="step.title" v-reveal="index * 100" class="step relative flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <span class="font-display text-[3.5rem] leading-none text-accent italic lining-nums tabular-nums" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <h3 class="font-display text-[1.625rem] leading-tight">{{ step.title }}</h3>
          <p class="max-w-xs text-[0.9375rem] leading-relaxed text-muted">{{ step.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
