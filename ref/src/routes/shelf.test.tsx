import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
  listQuery: vi.fn(),
}))

vi.mock('../lib/session', () => ({ useSession: mocks.useSession }))
vi.mock('../lib/queries', () => ({
  followsQuery: mocks.followsQuery,
  listsQuery: mocks.listsQuery,
  listQuery: mocks.listQuery,
}))

import { renderWithProviders } from '../test/render'
import { ShelfRoute } from './shelf'

const page = (key: string, value: unknown) => ({
  queryKey: [key],
  queryFn: async () => value,
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.useSession.mockReturnValue({
    session: { did: 'did:plc:me', handle: 'me.test' },
    ready: true,
    end: vi.fn(),
    refresh: vi.fn(),
  })
  mocks.followsQuery.mockReturnValue(
    page('follows', {
      follows: [{ did: 'did:plc:a', handle: 'alice.test', displayName: 'Alice' }],
    }),
  )
  mocks.listsQuery.mockReturnValue(
    page('lists', {
      lists: [
        { uri: 'at://did:plc:me/app.bsky.graph.list/for-me', name: 'for me', listItemCount: 7 },
      ],
    }),
  )
  mocks.listQuery.mockReturnValue(
    page('list', {
      list: { name: 'for me', listItemCount: 1 },
      items: [{ subject: { did: 'did:plc:b', handle: 'bob.test', displayName: 'Bob' } }],
    }),
  )
})

describe('shelf', () => {
  it('shows the following group and every list as groups', async () => {
    renderWithProviders(<ShelfRoute />)

    expect(await screen.findByRole('button', { name: /following/ })).toBeTruthy()
    expect(await screen.findByRole('button', { name: /for me/ })).toBeTruthy()
  })

  it('opens the following group by default', async () => {
    renderWithProviders(<ShelfRoute />)

    expect(await screen.findByText('Alice')).toBeTruthy()
  })

  it('swaps the people when another group is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ShelfRoute />)

    await user.click(await screen.findByRole('button', { name: /for me/ }))

    expect(await screen.findByText('Bob')).toBeTruthy()
    expect(screen.queryByText('Alice')).toBeNull()
  })

  it('reports an unreachable shelf', async () => {
    mocks.followsQuery.mockReturnValue({
      queryKey: ['follows'],
      queryFn: async () => {
        throw new Error('offline')
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    })

    renderWithProviders(<ShelfRoute />)

    expect(await screen.findByText('the shelf could not be reached')).toBeTruthy()
  })
})
