// not reviewed
import { waitFor } from '@testing-library/vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ finishLogin: vi.fn(), refresh: vi.fn() }))

mockNuxtImport('finishLogin', () => mocks.finishLogin)
mockNuxtImport('getStoredDid', () => () => null)
mockNuxtImport('useSession', () => () => ({ refresh: mocks.refresh }))

import { renderWithProviders } from '../../utils/render'
import Callback from '~/pages/oauth/callback.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('oauth callback', () => {
  it('stores the session, scrubs the fragment, and navigates to the shelf', async () => {
    mocks.finishLogin.mockResolvedValue({ did: 'did:plc:me' })

    await renderWithProviders(Callback, { route: '/oauth/callback#code=abc&state=xyz' })
    const router = useRouter()

    await waitFor(() => expect(mocks.finishLogin).toHaveBeenCalledTimes(1))
    expect(mocks.finishLogin).toHaveBeenCalledWith('#code=abc&state=xyz')
    expect(window.location.hash).toBe('')
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/shelf'))
  })

  it('returns to the cover with a note when the callback fails', async () => {
    mocks.finishLogin.mockRejectedValue(new Error('stale state'))

    await renderWithProviders(Callback, { route: '/oauth/callback#code=abc&state=stale' })
    const router = useRouter()

    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(router.currentRoute.value.query.loginFailed).toBe('1')
    expect(window.location.hash).toBe('')
  })
})
