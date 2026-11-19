import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('getStoredDid', () => () => null)

import App from '~/app.vue'
import { renderWithProviders } from '../utils/render'

describe('app', () => {
  it('renders the cover route', async () => {
    await renderWithProviders(App, { route: '/' })

    expect(await screen.findByRole('heading', { name: /at-nook/ })).toBeTruthy()
  })
})
