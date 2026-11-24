// https://nuxt.com/docs/api/configuration/nuxt-config
import { execSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { oauthClientMetadata } from './app/utils/oauth-metadata'

// app domain
const siteHost = process.env.SITE_HOST

// build metadata shown in the footer. git may be unavailable in some build
// environments (e.g. tarball builds), so fall back to benign defaults.
const git = (args: string) => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}
// full describe output (e.g. v0.1.0 or v0.1.0-3-gb209818), empty when git or
// tags are unavailable; the footer omits missing parts instead of showing junk.
const version = git('describe --tags')

// shown in link previews alongside the static og image in public/og.png
const description = 'a calm, comfortable atproto posts reader without distractions'

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
  // the OAuth metadata is a static asset that must match the deploy origin, so
  // it is generated at build (gitignored) instead of committing a domain.
  hooks: {
    'build:before'() {
      const path = 'public/oauth-client-metadata.json'
      if (siteHost) {
        writeFileSync(path, `${JSON.stringify(oauthClientMetadata(siteHost), null, 2)}\n`)
      } else {
        rmSync(path, { force: true })
      }
    },
  },
  modules: ['@nuxt/eslint', '@vueuse/nuxt'],
  typescript: {
    tsConfig: {
      include: ['@/test/setup.ts', '@/test/utils/**/*'],
    },
  },
  app: {
    head: {
      title: `at-nook${process.env.NODE_ENV === 'development' ? ' (dev)' : ''}`,
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      // og:image must be an absolute URL, so it is only emitted when the deploy
      // origin (SITE_HOST) is known; the image itself is a static asset.
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: 'at-nook' },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        ...(siteHost
          ? [
              { property: 'og:image', content: `https://${siteHost}/og.png` },
              { property: 'og:image:width', content: '1200' },
              { property: 'og:image:height', content: '630' },
            ]
          : []),
      ],
      script:
        umamiHost && umamiId
          ? [
              {
                defer: true,
                src: `${umamiHost}/script.js`,
                'data-website-id': umamiId,
                ...(siteHost && { 'data-domains': siteHost }),
                // keep the OAuth authorization code in the callback fragment out of analytics
                'data-exclude-hash': 'true',
                'data-exclude-search': 'true',
              },
            ]
          : [],
    },
  },
  runtimeConfig: {
    public: {
      umamiHost,
      version,
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
