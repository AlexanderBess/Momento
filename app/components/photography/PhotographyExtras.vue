<script setup lang="ts">
import { ArrowUpRight, BookOpen, Sparkles, Star } from '@lucide/vue'
import type { Component } from 'vue'
import { photographyCrossSell } from '~/config/photography'
import { findService } from '~/config/services'
import type { ServiceSlug } from '~/types/service'

/*
 * Other MOMENTO products, presented compactly: a small image, the name, one line and a link to the
 * existing service page. The image is the service photo from config/services.ts; until it exists a
 * small icon tile is shown instead of a placeholder frame.
 */

const icons: Partial<Record<ServiceSlug, Component>> = { photobooks: BookOpen, photozones: Star, booth: Sparkles }

const items = photographyCrossSell
  .map((item) => ({ ...item, page: findService(item.service), icon: icons[item.service] ?? Sparkles }))
  .filter((item) => item.page !== undefined)
</script>

<template>
  <section class="bg-surface pb-[clamp(4rem,2.5rem+6vw,8rem)]" aria-labelledby="extras-title">
    <div class="container-page">
      <div class="border-t border-border pt-[clamp(3.5rem,2.5rem+4vw,6rem)]">
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading v-reveal eyebrow="05 / MOMENTO Extras" title="Сделайте воспоминания осязаемыми." heading-id="extras-title" />
          <p v-reveal="80" class="max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Дополните свою съёмку продуктами и услугами MOMENTO.
          </p>
        </div>

        <ul class="mt-10 grid md:mt-12 lg:grid-cols-3 lg:gap-8">
          <li v-for="(item, i) in items" :key="item.service" v-reveal="i * 90" class="border-t border-border lg:border-t-0">
            <NuxtLink
              :to="item.page!.href"
              class="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-5 py-6 sm:grid-cols-[5.5rem_minmax(0,1fr)] lg:py-0"
            >
              <div class="relative aspect-square overflow-hidden rounded-input bg-bg">
                <PhotoFrame
                  v-if="item.page!.image.src"
                  :image="item.page!.image"
                  ratio="fill"
                  :rounded="false"
                  sizes="120px"
                  zoom-on-hover
                />
                <div v-else class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <component
                    :is="item.icon"
                    class="size-6 text-accent transition-transform duration-(--motion-slow) ease-enter group-hover:-translate-y-0.5"
                    :stroke-width="1.25"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <h3 class="flex items-start justify-between gap-3 font-display text-[1.625rem] leading-tight transition-colors duration-(--motion-fast) group-hover:text-accent">
                  {{ item.title }}
                  <ArrowUpRight
                    class="mt-1 size-5 shrink-0 text-muted transition-[translate,color] duration-(--motion-normal) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    :stroke-width="1.5"
                    aria-hidden="true"
                  />
                </h3>
                <p class="text-[0.9375rem] leading-relaxed text-muted">{{ item.description }}</p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
