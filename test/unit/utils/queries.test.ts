import { describe, expect, it } from 'vitest'
import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  authorFeedQuery,
  followsQuery,
  listQuery,
  listsQuery,
  profileQuery,
  tagQuery,
} from '../../../app/utils/queries'

// the vue-query option types carry the response data in the key type, which
// makes direct reads of queryKey/initialPageParam awkward in assertions
function keyOf(options: unknown): unknown {
  return toValue((options as { queryKey: MaybeRefOrGetter<unknown> }).queryKey)
}

function firstPageParamOf(options: unknown): unknown {
  return (options as { initialPageParam?: unknown }).initialPageParam
}

describe('query options', () => {
  it('uses stable keys', () => {
    expect(keyOf(profileQuery('bsky.app'))).toEqual(['profile', 'bsky.app'])
    expect(keyOf(followsQuery('did:plc:a'))).toEqual(['follows', 'did:plc:a'])
    expect(keyOf(listsQuery('did:plc:a'))).toEqual(['lists', 'did:plc:a'])
    expect(keyOf(listQuery('at://x'))).toEqual(['list', 'at://x'])
    expect(keyOf(authorFeedQuery('bsky.app'))).toEqual(['authorFeed', 'bsky.app'])
    expect(keyOf(tagQuery('diary'))).toEqual(['tag', 'diary'])
  })

  it('uses undefined as the first page param', () => {
    expect(firstPageParamOf(followsQuery('did:plc:a'))).toBeUndefined()
    expect(firstPageParamOf(authorFeedQuery('bsky.app'))).toBeUndefined()
  })

  it('follows a reactive profile actor', () => {
    const actor = ref('bsky.app')
    const options = profileQuery(actor)

    expect(keyOf(options)).toEqual(['profile', 'bsky.app'])

    actor.value = 'next.test'

    expect(keyOf(options)).toEqual(['profile', 'next.test'])
  })

  it('follows a reactive feed actor', () => {
    const actor = ref('bsky.app')
    const options = authorFeedQuery(actor)

    expect(keyOf(options)).toEqual(['authorFeed', 'bsky.app'])

    actor.value = 'next.test'

    expect(keyOf(options)).toEqual(['authorFeed', 'next.test'])
  })
})
