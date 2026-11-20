<script setup lang="ts">
/**
 * Renders the question of useConfirm(). Lives once in the default layout; opens above the drawer
 * and the editors. Esc / ✕ / backdrop answer `dismiss`.
 */
const { pending, answer } = useConfirm()

const open = computed({
  get: () => Boolean(pending.value),
  set: (value) => {
    if (!value && pending.value) answer(pending.value.id, 'dismiss')
  },
})

// Keep the last question rendered while the dialog animates out.
const shown = shallowRef(pending.value)
watch(pending, (value) => {
  if (value) shown.value = value
})
</script>

<template>
  <BaseDialog v-model:open="open" :title="shown?.title ?? ''" size="sm">
    <template v-if="shown">
      <p v-if="shown.message" class="text-[0.9375rem] leading-relaxed text-muted">{{ shown.message }}</p>
      <div v-if="shown.details?.length" class="mt-5 grid gap-3">
        <div v-for="block in shown.details" :key="block.label" class="rounded-card bg-surface p-4 ring-1 ring-border">
          <p class="eyebrow">{{ block.label }}</p>
          <ul class="mt-2 grid gap-1 text-sm">
            <li v-for="line in block.lines" :key="line">{{ line }}</li>
          </ul>
        </div>
      </div>
    </template>
    <template v-if="shown" #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <BaseButton v-if="shown.cancelLabel" variant="secondary" @click="answer(shown.id, 'cancel')">
          {{ shown.cancelLabel }}
        </BaseButton>
        <BaseButton
          :class="shown.tone === 'danger' && 'bg-error! hover:bg-error/90!'"
          @click="answer(shown.id, 'confirm')"
        >
          {{ shown.confirmLabel }}
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>
