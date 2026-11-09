import tailwindcss from '@tailwindcss/vite'
import { brand } from './app/config/brand'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/fonts', '@nuxt/image', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  // Components are named by file name only (BaseButton, AppHeader),
  // folders are used purely for grouping.
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'description', content: brand.description },
        { name: 'theme-color', content: '#F5F2ED' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: {
    defaults: {
      subsets: ['cyrillic', 'latin'],
    },
    families: [
      // Interface font: forms, prices, navigation, body copy.
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal'], preload: true },
      // Editorial headings only.
      {
        name: 'Cormorant Garamond',
        provider: 'google',
        weights: [500, 600],
        styles: ['normal', 'italic'],
        // Both faces of the hero heading («Сохраняем» upright + «главное» italic) — it is the LCP element.
        preload: { weights: [500], styles: ['normal', 'italic'], subsets: ['cyrillic'] },
      },
    ],
  },

  image: {
    quality: 78,
    format: ['avif', 'webp'],
    // Mirrors Tailwind breakpoints used in the layout.
    screens: { sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  typescript: {
    strict: true,
  },
})
