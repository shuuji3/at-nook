// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare_module',
    // Emit a static SPA shell (index.html) while keeping the client bundle; the
    // Worker only serves assets since at-nook has no server routes.
    prerender: { routes: ['/'] },
    cloudflare: {
      // Generate .output/server/wrangler.json during build.
      deployConfig: true,
      wrangler: {
        name: 'at-nook',
        assets: {
          // Serve index.html for unmatched requests so client-side routes work.
          not_found_handling: 'single-page-application',
        },
      },
    },
  },
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  typescript: {
    tsConfig: {
      include: ['@/test/setup.ts', '@/test/utils/**/*'],
    },
  },
  app: {
    head: {
      title: 'at-nook',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  vite: {
    server: {
      allowedHosts: ['at-nook.shuuji3.xyz'],
    },
  },
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/zen-kurenaido.css',
    '~/assets/css/global.css',
    '~/assets/css/paper.css',
  ],
})
