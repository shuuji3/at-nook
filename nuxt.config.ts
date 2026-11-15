// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  typescript: {
    tsConfig: {
      exclude: ["app/**/*.test.ts", "app/**/*.test.tsx"],
    },
  },
  app: {
    head: {
      title: "at-nook",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  devServer: {
    host: '127.0.0.1',
    port: 12520,
  },
  vite: {
    server: {
      allowedHosts: ['at-nook.shuuji3.xyz', 'bell'],
    },
  },
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/zen-kurenaido.css',
    '~/assets/css/global.css',
    '~/assets/css/paper.css',
  ],
})
