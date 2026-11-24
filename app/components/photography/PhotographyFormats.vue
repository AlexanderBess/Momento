<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import { photographyMainFormats, photographyMoreFormats } from '~/config/photography'

/*
 * Photography Formats — the page's main information block.
 *
 * Group A: Portraits and Love Stories as two large editorial spreads (photo and copy swap sides on
 * desktop, frames of different proportions, hairline dividers; on mobile — photo, title, text, action).
 * Group B: three more formats as a compact text list without photos, deliberately quieter than group A.
 * Every action picks the format as the direction of the shoot and scrolls to the packages.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const { selectDirection } = usePhotographyOrder()

const main = photographyMainFormats.map((format, index) => ({
  ...format,
  index: pad(index + 1),
  reversed: index % 2 === 1,
}))

const more = photographyMoreFormats.map((format, index) => ({
  ...format,
  index: pad(main.length + index + 1),
}))
</script>

<template>
  <section id="formats" class="section-y bg-surface" aria-labelledby="formats-title">
    <div class="container-page">
      <div class="grid gap-6 border-b border-border pb-10 md:pb-14 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div class="lg:col-span-7">
          <p v-reveal class="eyebrow">02 / Photography Formats</p>
          <h2 id="formats-title" v-reveal="60" class="mt-5 font-display text-h2">Форматы съёмки</h2>
        </div>
        <p v-reveal="120" class="max-w-md text-[0.9375rem] leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
          От индивидуальных портретов до историй о двоих. Подбираем подход к каждой съёмке, сохраняя естественность,
          характер и атмосферу момента.
        </p>
      </div>

      <!-- ---------- Group A: main directions ---------- -->
      <article
        v-for="format in main"
        :key="format.id"
        class="grid gap-8 border-b border-border py-12 md:py-16 lg:grid-cols-12 lg:items-end lg:gap-8 lg:py-20"
        :aria-labelledby="`format-${format.id}`"
      >
        <!-- Photo first in the DOM → first on mobile. -->
        <ClipReveal
          class="lg:row-start-1"
          :class="format.reversed ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-6 lg:col-start-1'"
        >
          <figure class="group">
            <PhotographyFrame
              :image="format.image"
              :ratio="format.ratio"
              :index="format.index"
              :sizes="format.reversed ? '720px lg:700px' : '720px lg:600px'"
              zoom-on-hover
            />
          </figure>
        </ClipReveal>

        <div
          v-reveal="80"
          class="flex flex-col lg:row-start-1 lg:pb-2"
          :class="format.reversed ? 'lg:col-span-4 lg:col-start-1' : 'lg:col-span-5 lg:col-start-8'"
        >
          <span class="font-display text-[clamp(3.5rem,2.6rem+3.5vw,6rem)] leading-none text-text/15 italic" aria-hidden="true">
            {{ format.index }}
          </span>
          <h3 :id="`format-${format.id}`" class="mt-3 font-display text-[clamp(2.5rem,1.9rem+2.6vw,4rem)] leading-none">
            {{ format.title }}
          </h3>
          <p class="eyebrow mt-5">{{ format.label }}</p>
          <span class="mt-6 h-px w-14 bg-text" aria-hidden="true" />
          <p class="mt-6 max-w-sm font-display text-[1.5rem] leading-snug italic md:text-[1.75rem]">
            {{ format.description }}
          </p>
          <NuxtLink
            to="#pricing"
            class="group/link mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent underline-offset-[6px] hover:underline"
            @click="selectDirection(format.id)"
          >
            Выбрать это направление
            <ArrowRight
              class="size-4 transition-transform duration-(--motion-normal) ease-standard group-hover/link:translate-x-0.5"
              :stroke-width="2"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
      </article>

      <!-- ---------- Group B: more formats, compact list ---------- -->
      <div class="pt-12 md:pt-16">
        <p v-reveal class="eyebrow">Также снимаем</p>
        <ul class="mt-6 grid md:grid-cols-3 md:gap-8">
          <li v-for="(format, i) in more" :key="format.id" v-reveal="i * 90" class="border-t border-border md:border-t-0">
            <NuxtLink
              to="#pricing"
            class="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-3 py-6 md:block md:border-l md:border-border md:py-1 md:pl-6"
              :aria-label="`${format.title} — выбрать направление съёмки`"
              @click="selectDirection(format.id)"
            >
              <span class="pt-0.5 font-display text-lg text-muted italic md:block" aria-hidden="true">{{ format.index }}</span>
              <span class="flex flex-col gap-1.5 md:mt-3">
                <span class="font-display text-[1.625rem] leading-tight transition-colors duration-(--motion-fast) group-hover:text-accent">
                  {{ format.title }}
                </span>
                <span class="text-[0.9375rem] leading-relaxed text-muted">{{ format.description }}</span>
              </span>
              <ArrowUpRight
                class="mt-1.5 size-5 text-muted transition-[translate,color] duration-(--motion-normal) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent md:mt-4"
                :stroke-width="1.5"
                aria-hidden="true"
              />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
