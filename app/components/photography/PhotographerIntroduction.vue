<script setup lang="ts">
import { photographer } from '~/config/photography'
</script>

<template>
  <section class="section-y" aria-labelledby="photographer-title">
    <div class="container-page grid items-center gap-10 md:grid-cols-12 md:gap-8">
      <div class="md:col-span-5 lg:col-span-4 lg:col-start-2">
        <ClipReveal class="mx-auto w-full max-w-[24rem] md:max-w-none">
          <PhotographyFrame :image="photographer.photo" ratio="4 / 5" sizes="420px md:360px" />
        </ClipReveal>
      </div>

      <div class="md:col-span-7 md:pl-6 lg:col-span-6 lg:col-start-7 lg:pl-0">
        <p v-reveal class="eyebrow">06 / Photographer</p>
        <h2 id="photographer-title" v-reveal="60" class="mt-5 font-display text-h2">
          За каждым кадром <em class="italic">стоит человек.</em>
        </h2>

        <p v-reveal="120" class="mt-8 flex items-center gap-4">
          <span class="h-px w-10 bg-text" aria-hidden="true" />
          <span v-if="photographer.name" class="font-display text-2xl">{{ photographer.name }}</span>
          <span class="eyebrow">{{ photographer.role }}</span>
        </p>

        <blockquote v-reveal="160" class="mt-7 font-display text-[1.5rem] leading-snug italic md:text-[1.75rem]">
          {{ photographer.approach }}
        </blockquote>
        <p v-reveal="200" class="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
          {{ photographer.collaboration }}
        </p>
      </div>
    </div>
  </section>
</template>
