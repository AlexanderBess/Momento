<script setup lang="ts">
import { brand } from '~/config/brand'
import { footerNavigation, legalLinks } from '~/config/navigation'

const { contacts, socials, legal } = brand
const year = new Date().getFullYear()

const phoneHref = contacts.phone ? `tel:${contacts.phone.replace(/[^\d+]/g, '')}` : null
const hasContacts = Boolean(contacts.phone || contacts.email || contacts.city || contacts.workingHours)
const legalLine = [legal.companyName, legal.inn && `ИНН ${legal.inn}`, legal.ogrn && `ОГРН ${legal.ogrn}`]
  .filter(Boolean)
  .join(' · ')
</script>

<template>
  <footer class="border-t border-border bg-bg">
    <div class="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 lg:py-20">
      <div class="flex flex-col gap-4">
        <AppLogo class="self-start" />
        <p class="max-w-xs font-display text-[1.625rem] leading-snug text-text">{{ brand.tagline }}</p>
        <p class="max-w-sm text-sm text-muted">{{ brand.region }}</p>

        <address v-if="hasContacts" class="mt-2 flex flex-col gap-1.5 text-sm not-italic">
          <a v-if="contacts.phone && phoneHref" :href="phoneHref" class="w-fit hover:text-accent">{{ contacts.phone }}</a>
          <a v-if="contacts.email" :href="`mailto:${contacts.email}`" class="w-fit hover:text-accent">{{ contacts.email }}</a>
          <span v-if="contacts.city" class="text-muted">{{ contacts.city }}</span>
          <span v-if="contacts.workingHours" class="text-muted">{{ contacts.workingHours }}</span>
        </address>

        <ul v-if="socials.length" class="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li v-for="social in socials" :key="social.network">
            <a :href="social.url" target="_blank" rel="noopener noreferrer" class="hover:text-accent">{{ social.label }}</a>
          </li>
        </ul>
      </div>

      <nav v-for="group in footerNavigation" :key="group.title" :aria-label="group.title">
        <h2 class="eyebrow mb-4">{{ group.title }}</h2>
        <ul class="flex flex-col gap-1">
          <li v-for="link in group.links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="inline-flex min-h-10 items-center text-[0.9375rem] text-text/85 transition-colors duration-(--motion-fast) hover:text-accent"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="container-page flex flex-col gap-3 border-t border-border/70 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
      <p>© {{ year }} {{ brand.name }}<template v-if="legalLine"> · {{ legalLine }}</template></p>
      <ul class="flex flex-wrap gap-x-6 gap-y-2">
        <li v-for="link in legalLinks" :key="link.to">
          <NuxtLink :to="link.to" class="inline-flex min-h-6 items-center underline-offset-4 hover:text-text hover:underline">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>
