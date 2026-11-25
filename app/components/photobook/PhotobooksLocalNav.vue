<script setup lang="ts">
const links = [
  { label: 'Все фотокниги', to: '/services/photobooks' },
  { label: 'Персональные', to: '/services/photobooks/personal' },
  { label: 'Выпускные', to: '/services/photobooks/graduation' },
]
</script>

<template>
  <nav class="border-b border-border" aria-label="Раздел фотокниг">
    <ul class="container-page flex flex-wrap gap-x-2 gap-y-1 py-2.5 sm:gap-x-4">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          class="inline-flex min-h-11 items-center rounded-button px-2.5 text-xs font-semibold text-muted hover:text-text sm:px-4 sm:text-sm [&[aria-current=page]]:bg-accent-soft [&[aria-current=page]]:text-accent [&[aria-current=page]]:underline [&[aria-current=page]]:underline-offset-4"
        >
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
