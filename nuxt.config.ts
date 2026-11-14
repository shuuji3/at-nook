// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  typescript: {
    tsConfig: {
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  },
  app: {
    head: {
      title: "at-nook",
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  srcDir: 'src',
  dir: {
    pages: 'routes',
    public: 'public',
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
    '~/styles/fonts.css',
    '~/styles/zen-kurenaido.css',
    '~/styles/global.css',
    '~/styles/paper.css',
  ],
  
})
