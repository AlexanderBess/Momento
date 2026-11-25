<script setup lang="ts">
import type { GraduationTemplate } from '~/config/photobook/graduation'

defineProps<{ template: GraduationTemplate; selected: boolean }>()
defineEmits<{ select: [] }>()

const galleryOpen = ref(false)
</script>

<template>
  <article class="flex h-full min-w-0 flex-col overflow-hidden rounded-card border bg-bg" :class="selected ? 'border-accent' : 'border-border'">
    <PhotobooksVisual :image="template.cover" tone="sage" ratio="2 / 1" sizes="480px lg:360px" />
    <div class="flex flex-1 flex-col items-start gap-3 p-5">
      <h3 class="font-display text-h3">{{ template.name }}</h3>
      <p class="text-sm text-muted">{{ template.description }}</p>
      <ul v-if="template.tags.length" class="flex flex-wrap gap-1.5" aria-label="Особенности оформления">
        <li v-for="tag in template.tags" :key="tag" class="rounded-full bg-[#e3e8de] px-2.5 py-1 text-xs text-text">{{ tag }}</li>
      </ul>
      <div class="mt-auto flex flex-wrap gap-2 pt-2">
        <BaseButton
          :variant="selected ? 'primary' : 'secondary'"
          :aria-pressed="selected"
          :aria-label="`Выбрать шаблон: ${template.name}`"
          @click="$emit('select')"
        >
          {{ selected ? 'Шаблон выбран' : 'Выбрать шаблон' }}
        </BaseButton>
        <BaseButton v-if="template.gallery?.length" variant="ghost" @click="galleryOpen = true">Смотреть развороты</BaseButton>
      </div>
    </div>
    <BaseDialog v-if="template.gallery?.length" v-model:open="galleryOpen" :title="`Примеры разворотов · ${template.name}`" size="lg">
      <div v-if="galleryOpen" class="grid gap-3 sm:grid-cols-2">
        <PhotobooksVisual
          v-for="(spread, index) in template.gallery" :key="index" :image="spread"
          class="rounded-card" tone="sage" ratio="4 / 3" sizes="360px sm:440px"
        />
      </div>
    </BaseDialog>
  </article>
</template>
