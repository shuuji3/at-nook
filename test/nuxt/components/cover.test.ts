import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ startLogin: vi.fn(), get: vi.fn() }))

mockNuxtImport('startLogin', () => mocks.startLogin)
mockNuxtImport('getClient', () => () => ({ get: mocks.get }))

import { renderWithProviders } from '../../utils/render'
import Cover from '~/components/cover.vue'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('location', { ...window.location, assign: vi.fn() })
  mocks.startLogin.mockResolvedValue(new URL('https://auth.example/'))
  mocks.get.mockResolvedValue({
    ok: true,
    data: { actors: [{ did: 'did:plc:z', handle: 'bsky.app', displayName: 'Bluesky' }] },
  })
})

describe('cover', () => {
  it('signs in with the typed handle', async () => {
    const user = userEvent.setup()
    await renderWithProviders(Cover)

    await user.type(screen.getByLabelText('handle'), '@bsky.app')
    await user.click(screen.getByRole('button', { name: 'open notebook' }))

    expect(mocks.startLogin).toHaveBeenCalledWith('bsky.app')
  })

  it('offers candidates and writes the chosen display name', async () => {
    const user = userEvent.setup()
    await renderWithProviders(Cover)

    await user.type(screen.getByLabelText('handle'), 'bsk')

    const candidate = await screen.findByRole('option', { name: /Bluesky/ })
    expect(mocks.get).toHaveBeenCalledWith('app.bsky.actor.searchActorsTypeahead', {
      params: { q: 'bsk', limit: 8 },
    })

    await user.click(candidate)

    expect(screen.getByText('Bluesky')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'open notebook' }))
    expect(mocks.startLogin).toHaveBeenCalledWith('bsky.app')
  })

  it('moves through candidates with the arrow keys', async () => {
    const user = userEvent.setup()
    await renderWithProviders(Cover)

    const input = screen.getByLabelText('handle')
    await user.type(input, 'bsk')
    await screen.findByRole('option', { name: /Bluesky/ })

    await user.keyboard('{ArrowDown}{Enter}')

    expect(screen.getByText('Bluesky')).toBeTruthy()
    expect((screen.getByLabelText('handle') as HTMLInputElement).value).toBe('bsky.app')

    await user.click(screen.getByRole('button', { name: 'open notebook' }))
    expect(mocks.startLogin).toHaveBeenCalledWith('bsky.app')
  })

  it('links to the guest shelf without signing in', async () => {
    await renderWithProviders(Cover)

    expect(screen.getByRole('link', { name: 'or enter as a guest' })).toHaveAttribute(
      'href',
      '/shelf',
    )
  })

  it('keeps the button shut with nothing typed', async () => {
    await renderWithProviders(Cover)

    expect(screen.getByRole('button', { name: 'open notebook' })).toBeDisabled()
    expect(mocks.startLogin).not.toHaveBeenCalled()
  })

  it('reports a failed sign-in', async () => {
    await renderWithProviders(Cover, { route: '/?loginFailed=1' })

    expect(screen.getByText('sign-in did not finish. try again.')).toBeTruthy()
  })
})
