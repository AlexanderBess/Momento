<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { services } from '~/config/services'

useSeoMeta({ title: 'Услуги', robots: 'noindex, follow' })
</script>

<template>
  <section class="container-page section-y">
    <SectionHeading as="h1" eyebrow="Услуги" title="Всё для ярких моментов" />
    <ul class="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="(service, index) in services" :key="service.slug" v-reveal="index * 80">
        <NuxtLink :to="service.href" class="group flex flex-col gap-4">
          <PhotoFrame :image="service.image" ratio="4 / 5" zoom-on-hover sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
          <span class="flex items-start justify-between gap-4">
            <span>
              <span class="block font-display text-h3">{{ service.title }}</span>
              <span class="mt-1 block text-sm text-muted">{{ service.summary }}</span>
            </span>
            <ArrowUpRight
              class="mt-1.5 size-5 shrink-0 text-muted transition-transform duration-(--motion-normal) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              :stroke-width="1.5"
              aria-hidden="true"
            />
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
