// https://nuxt.com/docs/api/configuration/nuxt-config
import { rmSync, writeFileSync } from 'node:fs'

// app domain
const siteHost = process.env.SITE_HOST

// analytics are optional: the tracker is only injected when the deploy
// environment has these envs. forks that set nothing get no analytics.
const umamiHost = process.env.NUXT_PUBLIC_UMAMI_HOST
const umamiId = process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID

/** atproto client metadata for a deploy, keyed to the origin it is served from. */
function oauthClientMetadata(host: string) {
  return {
    client_id: `https://${host}/oauth-client-metadata.json`,
    client_name: 'at-nook',
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: 'atproto include?nsid=app.bsky.authViewAll&aud=did:web:api.bsky.app%23bsky_appview',
    redirect_uris: [`https://${host}/oauth/callback`],
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  }
}

// cancels tracking when the browser signals an opt-out. GPC is the current
// signal (Firefox/Brave/DuckDuckGo); browsers without GPC (Chrome/Safari/Edge)
// fall back to legacy Do Not Track. DNT is only consulted when GPC is absent,
// so Firefox's stale DNT value cannot block a user who did not opt out.
const privacyGate = `window.__privacyGate = function (type, payload) {
  const gpc = navigator.globalPrivacyControl
  if (typeof gpc === 'boolean') {
    return gpc === true ? false : payload
  }
  const dnt = navigator.doNotTrack || navigator.msDoNotTrack
  return dnt === 1 || dnt === '1' || dnt === 'yes' ? false : payload
}`

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
      title: 'at-nook',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script:
        umamiHost && umamiId
          ? [
              { innerHTML: privacyGate },
              {
                defer: true,
                src: `${umamiHost}/script.js`,
                'data-website-id': umamiId,
                ...(siteHost && { 'data-domains': siteHost }),
                'data-before-send': '__privacyGate',
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
