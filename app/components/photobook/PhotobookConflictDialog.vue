<script setup lang="ts">
/**
 * The open book was saved elsewhere (another tab, or the editor in «Моя подборка») while this
 * studio had unsaved changes. Nothing is overwritten until the visitor picks one of two ways.
 * Closing the dialog without a choice keeps autosave paused (the bar shows the state).
 */
const project = usePhotobookProject()

const open = computed({
  get: () => Boolean(project.conflict.value),
  set: () => {
    // Esc / ✕: choice postponed; it is asked again on the next change.
  },
})
</script>

<template>
  <BaseDialog v-model:open="open" title="Книгу изменили в другом окне" size="sm" guarded>
    <template v-if="project.conflict.value">
      <p class="text-[0.9375rem] leading-relaxed text-muted">
        Пока вы работали здесь, эту книгу сохранили в другой вкладке или в редакторе подборки. Чтобы ничего не потерять,
        выберите, как продолжить.
      </p>
      <div class="mt-5 rounded-card bg-surface p-4 text-sm ring-1 ring-border">
        <template v-if="project.conflict.value.fields.length">
          <p class="font-semibold">Изменены в обоих местах:</p>
          <p class="mt-1 text-muted">{{ project.conflict.value.fields.join(', ') }}</p>
          <p class="mt-3 text-xs text-muted">
            При повторном применении в этих полях останутся ваши значения. Остальные изменения другого окна сохранятся.
          </p>
        </template>
        <p v-else class="text-muted">Изменения не пересекаются — ваши правки можно применить поверх новой версии.</p>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" @click="project.loadLatest()">Загрузить актуальную версию</BaseButton>
        <BaseButton @click="project.reapplyMine()">Повторно применить мои изменения</BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>
