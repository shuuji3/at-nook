import { screen } from '@testing-library/vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
  listQuery: vi.fn(),
}))

mockNuxtImport('useSession', () => () => ({
  session: { value: null },
  ready: { value: true },
  end: vi.fn(),
  refresh: vi.fn(),
}))
mockNuxtImport('profileQuery', () => mocks.profileQuery)
mockNuxtImport('followsQuery', () => mocks.followsQuery)
mockNuxtImport('listsQuery', () => mocks.listsQuery)
mockNuxtImport('listQuery', () => mocks.listQuery)

import { renderWithProviders } from '../../utils/render'
import ProfileShelf from '~/pages/profile/[actor]/shelf.vue'

function page(key: string, value: unknown) {
  return {
    queryKey: [key],
    queryFn: async () => value,
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.profileQuery.mockReturnValue(
    page('profile', { did: 'did:plc:a', handle: 'atproto.com', displayName: 'AT Protocol' }),
  )
  mocks.followsQuery.mockReturnValue(
    page('follows', {
      follows: [{ did: 'did:plc:a', handle: 'alice.test', displayName: 'Alice' }],
    }),
  )
  mocks.listsQuery.mockReturnValue(page('lists', { lists: [] }))
  mocks.listQuery.mockReturnValue(page('list', { list: { name: 'list' }, items: [] }))
})

describe('profile shelf', () => {
  it('shelves the route actor', async () => {
    await renderWithProviders(ProfileShelf, { route: '/profile/atproto.com/shelf' })

    expect(await screen.findByText('Alice')).toBeTruthy()
    expect(screen.getByText('shelf of @atproto.com')).toBeTruthy()
    const [actor] = mocks.followsQuery.mock.calls[0] as [() => string]
    expect(actor()).toBe('atproto.com')
  })
})
