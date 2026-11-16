// not reviewed
import { screen } from '@testing-library/vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  listQuery: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
}))

mockNuxtImport('useSession', () => () => ({
  session: { value: { did: 'did:plc:me', handle: 'me.test' } },
  ready: { value: true },
  end: vi.fn(),
  refresh: vi.fn(),
}))
mockNuxtImport('profileQuery', () => mocks.profileQuery)
mockNuxtImport('listQuery', () => mocks.listQuery)
mockNuxtImport('followsQuery', () => mocks.followsQuery)
mockNuxtImport('listsQuery', () => mocks.listsQuery)

import { renderWithProviders } from '../../utils/render'
import ListGrid from '~/pages/profile/[actor]/list/[rkey].vue'

const alice = {
  did: 'did:plc:a',
  handle: 'alice.test',
  displayName: 'Alice',
}
const bob = { did: 'did:plc:b', handle: 'bob.test', displayName: 'Bob' }

const listPage = (items: unknown[]) => ({
  queryKey: ['list'],
  queryFn: async () => ({
    list: { name: 'for me', listItemCount: items.length },
    items: items.map((subject) => ({ subject })),
    cursor: undefined,
  }),
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.profileQuery.mockImplementation((actor: string) => ({
    queryKey: ['profile', actor],
    queryFn: async () => ({ did: 'did:plc:me', handle: actor }),
  }))
  mocks.listQuery.mockReturnValue(listPage([alice, bob]))
  mocks.followsQuery.mockReturnValue(listPage([]))
  mocks.listsQuery.mockReturnValue(listPage([]))
})

describe('list grid', () => {
  it('shows the list name and its members', async () => {
    await renderWithProviders(ListGrid, {
      route: '/profile/me.test/list/for-me',
    })

    expect(await screen.findByRole('heading', { name: /for me/ })).toBeTruthy()
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Alice/ })).toHaveAttribute(
      'href',
      '/profile/alice.test',
    )
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('says when a list has no members', async () => {
    mocks.listQuery.mockReturnValue(listPage([]))

    await renderWithProviders(ListGrid, {
      route: '/profile/me.test/list/empty',
    })

    expect(await screen.findByText('this list is empty')).toBeTruthy()
  })

  it('shows not found when the list cannot be read', async () => {
    mocks.listQuery.mockReturnValue({
      queryKey: ['list'],
      queryFn: async () => {
        throw new Error('List not found')
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    })

    await renderWithProviders(ListGrid, {
      route: '/profile/me.test/list/missing',
    })

    expect(await screen.findByText('404 not found')).toBeTruthy()
  })
})
