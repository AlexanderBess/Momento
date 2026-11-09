<script setup lang="ts">
import { brand } from '~/config/brand'
</script>

<template>
  <NuxtLink
    to="/"
    class="inline-flex items-center rounded-sm text-[1.0625rem] font-bold tracking-[0.28em] text-text uppercase transition-opacity duration-(--motion-fast) hover:opacity-75"
    :aria-label="`${brand.name} — на главную`"
  >
    {{ brand.name }}
  </NuxtLink>
</template>
