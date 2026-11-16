import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  listQuery: vi.fn(),
  getStoredDid: vi.fn(),
}))

vi.mock('../lib/auth', () => ({
  getStoredDid: mocks.getStoredDid,
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('../lib/session', () => ({
  SessionProvider: ({ children }: { children: unknown }) => children,
  useSession: () => ({
    session: { did: 'did:plc:me', handle: 'me.test' },
    ready: true,
    end: vi.fn(),
    refresh: vi.fn(),
  }),
}))
vi.mock('../lib/queries', () => ({
  profileQuery: mocks.profileQuery,
  listQuery: mocks.listQuery,
  followsQuery: vi.fn(() => ({
    queryKey: ['follows'],
    queryFn: async () => ({ follows: [] }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  })),
  listsQuery: vi.fn(() => ({
    queryKey: ['lists'],
    queryFn: async () => ({ lists: [] }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  })),
}))

import { App } from '../app'
import { renderWithProviders } from '../test/render'

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
  mocks.getStoredDid.mockReturnValue(null)
  mocks.profileQuery.mockImplementation((actor: string) => ({
    queryKey: ['profile', actor],
    queryFn: async () => ({ did: 'did:plc:me', handle: actor }),
  }))
  mocks.listQuery.mockReturnValue(listPage([alice, bob]))
})

describe('list grid', () => {
  it('shows the list name and its members', async () => {
    renderWithProviders(<App />, { route: '/profile/me.test/list/for-me' })

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

    renderWithProviders(<App />, { route: '/profile/me.test/list/empty' })

    expect(await screen.findByText('this list is empty')).toBeTruthy()
  })

  it('shows a torn page when the list cannot be read', async () => {
    mocks.listQuery.mockReturnValue({
      queryKey: ['list'],
      queryFn: async () => {
        throw new Error('List not found')
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    })

    renderWithProviders(<App />, { route: '/profile/me.test/list/missing' })

    expect(await screen.findByText('this page is torn out')).toBeTruthy()
  })
})
