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
        // Don't assign a public *.workers.dev URL or per-deployment preview URLs.
        workers_dev: false,
        preview_urls: false,
        // Single custom domain, Production and Preview. Previews are served at
        // <preview-name>.at-nook.shuuji3.xyz; Cloudflare auto-creates the wildcard
        // DNS/cert for previews (as in the reference project).
        routes: [
          {
            pattern: 'at-nook.shuuji3.xyz',
            custom_domain: true,
            // @ts-expect-error valid cloudflare wrangler route field (Production and Preview, see
            // developers.cloudflare.com/workers/previews/custom-domains/)
            // nitropack's vendored route type lags and doesn't include previews_enabled yet.
            // Removes itself once fixed.
            previews_enabled: true,
          },
        ],
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
