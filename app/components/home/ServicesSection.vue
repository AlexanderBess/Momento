<script setup lang="ts">
import { services } from '~/config/services'
</script>

<template>
  <section id="services" class="section-y clip-x" aria-labelledby="services-title">
    <div class="container-page">
      <SectionHeading v-reveal eyebrow="Услуги" title="Всё для ярких моментов" heading-id="services-title" />

      <!--
        Mobile: horizontal snap carousel with a peek of the next card (one-hand friendly).
        Tablet: 2 columns. Desktop: 4 columns.
      -->
      <ul
        class="no-scrollbar -mx-(--gutter) mt-10 flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto px-(--gutter) pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 md:mt-14 lg:grid-cols-4"
        aria-label="Услуги"
      >
        <li
          v-for="(service, index) in services"
          :key="service.slug"
          v-reveal="index * 90"
          class="w-[78%] max-w-80 shrink-0 snap-start sm:w-auto sm:max-w-none"
        >
          <ServiceCard :service="service" />
        </li>
      </ul>
    </div>
  </section>
</template>
