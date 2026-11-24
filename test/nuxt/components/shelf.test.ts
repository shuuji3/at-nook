import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
  listQuery: vi.fn(),
}))

const sessionState = vi.hoisted(() => ({
  current: { did: 'did:plc:me', handle: 'me.test' } as { did: string; handle: string } | null,
}))

mockNuxtImport('useSession', () => () => ({
  session: {
    get value() {
      return sessionState.current
    },
  },
  ready: { value: true },
  end: vi.fn(),
  refresh: vi.fn(),
}))
mockNuxtImport('profileQuery', () => mocks.profileQuery)
mockNuxtImport('followsQuery', () => mocks.followsQuery)
mockNuxtImport('listsQuery', () => mocks.listsQuery)
mockNuxtImport('listQuery', () => mocks.listQuery)

import { renderWithProviders } from '../../utils/render'
import Shelf from '~/components/shelf.vue'

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
  sessionState.current = { did: 'did:plc:me', handle: 'me.test' }
  mocks.profileQuery.mockReturnValue(
    page('profile', { did: 'did:plc:me', handle: 'me.test', displayName: 'Me' }),
  )
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
    await renderWithProviders(Shelf)

    expect(await screen.findByRole('button', { name: /following/ })).toBeTruthy()
    expect(await screen.findByRole('button', { name: /for me/ })).toBeTruthy()
  })

  it('opens the following group by default', async () => {
    await renderWithProviders(Shelf)

    expect(await screen.findByText('Alice')).toBeTruthy()
  })

  it('swaps the people when another group is chosen', async () => {
    const user = userEvent.setup()
    await renderWithProviders(Shelf)

    await user.click(await screen.findByRole('button', { name: /for me/ }))

    expect(await screen.findByText('Bob')).toBeTruthy()
    expect(screen.queryByText('Alice')).toBeNull()
  })

  it('shelves atproto.com when signed out', async () => {
    sessionState.current = null

    await renderWithProviders(Shelf)

    expect(await screen.findByText('Alice')).toBeTruthy()
    const [actor] = mocks.followsQuery.mock.calls[0] as [() => string]
    expect(actor()).toBe('did:plc:ewvi7nxzyoun6zhxrhs64oiz')
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

    await renderWithProviders(Shelf)

    expect(await screen.findByText('the shelf could not be reached')).toBeTruthy()
  })
})
