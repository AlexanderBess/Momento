
<script setup lang="ts">
const principles = [
  {
    number: '01',
    title: 'С вниманием к деталям',
    text: 'Продумываем не только результат, но и весь визуальный опыт — от первой идеи до последних штрихов.',
  },
  {
    number: '02',
    title: 'С заботой об эмоциях',
    text: 'Для нас важны не просто красивые кадры, а настоящие моменты, которые хочется переживать снова.',
  },
  {
    number: '03',
    title: 'С открытостью к новому',
    text: 'Объединяем творческие подходы и современные технологии, чтобы находить необычные решения.',
  },
]
</script>

<template>
  <section
    class="section-y bg-surface"
    aria-labelledby="about-approach-title"
  >
    <div class="container-page">
      <SectionHeading
        v-reveal
        as="h2"
        title="Внимание к тому, что действительно важно"
        heading-id="about-approach-title"
        class="mb-12 md:mb-16"
      />

      <ul class="grid gap-10 md:grid-cols-3 md:gap-12" role="list">
        <li
          v-for="(principle, index) in principles"
          :key="principle.number"
          v-reveal="index * 100"
          class="flex flex-col items-start gap-4 border-t border-border pt-5"
        >
          <span class="font-display text-3xl text-muted-soft">
            {{ principle.number }}
          </span>

          <h3 class="font-display text-h3 text-text">
            {{ principle.title }}
          </h3>

          <p class="max-w-sm leading-relaxed text-muted">
            {{ principle.text }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
