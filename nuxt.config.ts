export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  app: {
    head: {
      title: 'TIYUHM',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  css: [
    '@fontsource/special-elite',
    '@fontsource/courier-prime/400.css',
    '@fontsource/courier-prime/700.css',
    '@fontsource/unifrakturcook/700.css',
    '~/assets/css/theme.css',
  ],
})
