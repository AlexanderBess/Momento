<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: isNotFound.value ? 'Страница не найдена' : 'Ошибка', robots: 'noindex' })
</script>

<template>
  <NuxtLayout>
    <section class="container-page flex min-h-[60svh] flex-col justify-center py-20">
      <SectionHeading
        as="h1"
        :eyebrow="`Ошибка ${error.statusCode}`"
        :title="isNotFound ? 'Такой страницы нет' : 'Что-то пошло не так'"
        :lead="isNotFound ? 'Возможно, ссылка устарела или в адресе опечатка.' : 'Попробуйте обновить страницу чуть позже.'"
      />
      <div class="mt-10">
        <BaseButton variant="secondary" @click="clearError({ redirect: '/' })">На главную</BaseButton>
      </div>
    </section>
  </NuxtLayout>
</template>
