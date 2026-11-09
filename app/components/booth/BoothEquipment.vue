<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { boothEquipment, boothEquipmentSpecs, boothHotspots, boothKit } from '~/config/booth'

const kitRows = [
  { label: 'Камера', value: boothKit.camera },
  { label: 'Монитор', value: boothKit.monitor },
  { label: 'Принтер', value: boothKit.printer },
].filter((row): row is { label: string; value: string } => Boolean(row.value))

const media = useTemplateRef<HTMLDivElement>('media')
useParallax(media, 16)
</script>

<template>
  <section id="equipment" class="section-y bg-surface" aria-labelledby="equipment-title">
    <div class="container-page grid items-center gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
      <div ref="media" class="parallax-media mx-auto w-full max-w-[24rem] md:max-w-none">
        <div v-reveal>
          <EquipmentHotspots
            :image="boothEquipment.image"
            :hotspots="boothHotspots"
            sizes="(min-width: 1024px) 460px, (min-width: 768px) 40vw, 384px"
          />
        </div>
      </div>

      <div class="flex flex-col gap-8">
        <SectionHeading
          v-reveal
          eyebrow="Оборудование"
          :title="boothEquipment.name"
          heading-id="equipment-title"
          :lead="boothEquipment.description"
        />

        <div v-reveal="100">
          <dl class="grid grid-cols-1 border-t border-border sm:grid-cols-2 sm:gap-x-8">
            <div v-for="spec in boothEquipmentSpecs" :key="spec.label" class="flex flex-col gap-1 border-b border-border py-4">
              <dt class="text-sm text-muted">{{ spec.label }}</dt>
              <dd class="font-semibold">{{ spec.value }}</dd>
            </div>
            <div v-for="row in kitRows" :key="row.label" class="flex flex-col gap-1 border-b border-border py-4">
              <dt class="text-sm text-muted">{{ row.label }}</dt>
              <dd class="font-semibold">{{ row.value }}</dd>
            </div>
            <div class="flex flex-col gap-1 border-b border-border py-4">
              <dt class="text-sm text-muted">Программа</dt>
              <dd class="font-semibold">{{ boothEquipment.software }}</dd>
            </div>
          </dl>

          <p class="mt-5 text-sm text-muted">
            Характеристики корпуса — по данным
            <a
              :href="boothEquipment.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-0.5 font-semibold text-text underline-offset-4 hover:text-accent hover:underline"
            >
              производителя<ArrowUpRight class="size-3.5" :stroke-width="2" aria-hidden="true" /><span class="sr-only"> (откроется в новой вкладке)</span>
            </a>. Комплектацию для вашего мероприятия, в том числе печать фотографий, уточним при обсуждении заявки.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.parallax-media {
  transform: translate3d(0, var(--parallax-y, 0px), 0);
}
</style>
