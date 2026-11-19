import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        // the unit project loads app modules outside Nuxt, so it needs the
        // srcDir `~` alias registered to match Nuxt's resolution
        resolve: {
          alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'jsdom',
          setupFiles: ['test/setup.ts'],
          env: { TZ: 'UTC' },
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          globals: true,
          env: { TZ: 'UTC' },
          setupFiles: ['test/setup.ts'],
          environmentOptions: { nuxt: { domEnvironment: 'jsdom' } },
        },
      }),
    ],
  },
})
