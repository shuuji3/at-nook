// https://nuxt.com/docs/api/configuration/nuxt-config

// app domain
const siteHost = process.env.SITE_HOST

// analytics are optional: the tracker is only injected when the deploy
// environment has these envs. forks that set nothing get no analytics.
const umamiHost = process.env.NUXT_PUBLIC_UMAMI_HOST
const umamiId = process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare_module',
    // Emit a static SPA shell (index.html) while keeping the client bundle; the
    // Worker serves assets plus the oauth-client-metadata route.
    prerender: { routes: ['/'] },
    cloudflare: {
      // Generate .output/server/wrangler.json during build.
      deployConfig: true,
      wrangler: {
        name: 'at-nook',
        // Don't assign a public *.workers.dev URL or per-deployment preview URLs.
        workers_dev: false,
        preview_urls: false,
        // Single custom domain, Production and Preview, from SITE_HOST. Cloudflare
        // auto-creates the wildcard DNS/cert for previews.
        routes: siteHost
          ? [
              {
                pattern: siteHost,
                custom_domain: true,
                // @ts-expect-error valid cloudflare wrangler route field (Production and Preview, see
                // developers.cloudflare.com/workers/previews/custom-domains/)
                // nitropack's vendored route type lags and doesn't include previews_enabled yet.
                // Removes itself once fixed.
                previews_enabled: true,
              },
            ]
          : [],
        assets: {
          // Serve index.html for unmatched requests so client-side routes work.
          not_found_handling: 'single-page-application',
        },
      },
    },
  },
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@vueuse/nuxt'],
  typescript: {
    tsConfig: {
      include: ['@/test/setup.ts', '@/test/utils/**/*'],
    },
  },
  app: {
    head: {
      title: 'at-nook',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script:
        umamiHost && umamiId
          ? [
              {
                defer: true,
                src: `${umamiHost}/script.js`,
                'data-website-id': umamiId,
                ...(siteHost && { 'data-domains': siteHost }),
                // honor Do Not Track where the browser exposes it
                'data-do-not-track': 'true',
                // keep the OAuth authorization code in the callback fragment out of analytics
                'data-exclude-hash': 'true',
                'data-exclude-search': 'true',
              },
            ]
          : [],
    },
  },
  vite: {
    server: {
      allowedHosts: siteHost ? [siteHost] : [],
    },
  },
  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/zen-kurenaido.css',
    '~/assets/css/global.css',
    '~/assets/css/paper.css',
  ],
})
