import { describe, expect, it } from 'vite-plus/test'
import { authorFeedQuery, followsQuery, listQuery, listsQuery, profileQuery } from './queries'

describe('query options', () => {
  it('uses stable keys', () => {
    expect(profileQuery('bsky.app').queryKey).toEqual(['profile', 'bsky.app'])
    expect(followsQuery('did:plc:a').queryKey).toEqual(['follows', 'did:plc:a'])
    expect(listsQuery('did:plc:a').queryKey).toEqual(['lists', 'did:plc:a'])
    expect(listQuery('at://x').queryKey).toEqual(['list', 'at://x'])
    expect(authorFeedQuery('bsky.app').queryKey).toEqual(['authorFeed', 'bsky.app'])
  })

  it('uses undefined as the first page param', () => {
    expect(followsQuery('did:plc:a').initialPageParam).toBeUndefined()
    expect(authorFeedQuery('bsky.app').initialPageParam).toBeUndefined()
  })
})
