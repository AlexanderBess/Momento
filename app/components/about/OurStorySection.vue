
<script setup lang="ts">
import type { ImageAsset } from '~/types/service'

const foundersImage: ImageAsset = {
  src: '/images/about/momento-founders.webp',
  alt: 'Основатели MOMENTO — семейная команда',
  width: 1024,
  height: 1536,
}

const storyDetailImage: ImageAsset = {
  src: '/images/about/printed-photos.webp',
  alt: 'Печатные фотографии, которые помогают сохранять семейные воспоминания',
  width: 1500,
  height: 2000,
}
</script>

<template>
  <section
    class="section-y clip-x relative"
    aria-labelledby="about-story-title"
  >
    <div class="container-page">
      <div class="grid items-center gap-12 md:grid-cols-[0.95fr_1.05fr] md:gap-16 lg:gap-24">
        <div class="relative mx-auto w-full max-w-[34rem] md:mx-0">
          <ClipReveal delay="200">
            <PhotoFrame
              :image="foundersImage"
              ratio="2 / 3"
              sizes="640px sm:520px md:480px lg:560px"
              class="w-full"
              :rounded="false"
            />
          </ClipReveal>

          <div
            class="absolute -bottom-8 -right-2 w-[38%] rotate-2 border border-border/60 bg-surface p-2 shadow-(--shadow-raised) md:-right-8 md:bottom-8 md:w-[34%]"
            aria-hidden="true"
          >
            <PhotoFrame
              :image="storyDetailImage"
              ratio="3 / 4"
              sizes="240px"
              :rounded="false"
            />
          </div>
        </div>
                <div class="flex flex-col gap-6">
          <SectionHeading
            v-reveal
            as="h2"
            title="Мы верим, что самые ценные вещи нельзя поставить на паузу"
            heading-id="about-story-title"
          />

          <div class="flex max-w-[34rem] flex-col gap-5">
            <p v-reveal="80" class="leading-relaxed text-muted">
              Мы — семейная команда, в которой творчество встречается с технологиями.
              Нам всегда хотелось создавать что-то, что вызывает искренние эмоции,
              притягивает взгляд и со временем становится тёплым воспоминанием.
            </p>

            <p v-reveal="160" class="leading-relaxed text-muted">
              Мы любим фотографию за её особенную магию. Один снимок может вернуть
              в важный день, напомнить о близких, передать атмосферу момента и вызвать
              то самое чувство, которое, казалось бы, давно осталось в прошлом.
            </p>

            <p v-reveal="240" class="leading-relaxed text-muted">
              Так родилась идея MOMENTO. Мы объединили творческий подход, технический
              опыт и любовь к визуальной красоте, чтобы помогать людям сохранять важное —
              через фотографии, необычные форматы впечатлений и детали, которые делают
              события особенными.
            </p>

            <p v-reveal="320" class="leading-relaxed text-muted">
              Мы рады, что можем быть частью ваших историй и создавать воспоминания,
              к которым хочется возвращаться.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>