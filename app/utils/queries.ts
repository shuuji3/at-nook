import { ok } from '@atcute/client'
import type { ActorIdentifier, ResourceUri } from '@atcute/lexicons'
import { infiniteQueryOptions, queryOptions, keepPreviousData } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { publicRpc, rpc } from '~/utils/rpc'

const ONE_MINUTE = 60_000
const FIVE_MINUTES = ONE_MINUTE * 5

/** A query key that re-reads its input, so route params stay live. */
function keyed(prefix: string, input: MaybeRefOrGetter<string>) {
  return computed(() => [prefix, toValue(input)])
}

/** Handle candidates for the cover's input. A public read, no session needed. */
export function actorCandidatesQuery(q: MaybeRefOrGetter<string>) {
  return queryOptions({
    queryKey: keyed('actorCandidates', q),
    queryFn: () =>
      ok(
        publicRpc.get('app.bsky.actor.searchActorsTypeahead', {
          params: { q: toValue(q), limit: 8 },
        }),
      ),
    staleTime: ONE_MINUTE,
  })
}

export function profileQuery(actor: MaybeRefOrGetter<string>) {
  return queryOptions({
    queryKey: keyed('profile', actor),
    queryFn: () =>
      ok(
        rpc.get('app.bsky.actor.getProfile', {
          params: { actor: toValue(actor) as ActorIdentifier },
        }),
      ),
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })
}

export function followsQuery(did: MaybeRefOrGetter<string>) {
  return infiniteQueryOptions({
    queryKey: keyed('follows', did),
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get('app.bsky.graph.getFollows', {
          params: { actor: toValue(did) as ActorIdentifier, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })
}

export function listsQuery(did: MaybeRefOrGetter<string>) {
  return infiniteQueryOptions({
    queryKey: keyed('lists', did),
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get('app.bsky.graph.getLists', {
          params: {
            actor: toValue(did) as ActorIdentifier,
            purposes: ['curatelist'],
            limit: 50,
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })
}

export function listQuery(uri: MaybeRefOrGetter<string>) {
  return infiniteQueryOptions({
    queryKey: keyed('list', uri),
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get('app.bsky.graph.getList', {
          params: { list: toValue(uri) as ResourceUri, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })
}

export function authorFeedQuery(actor: MaybeRefOrGetter<string>) {
  return infiniteQueryOptions({
    queryKey: keyed('authorFeed', actor),
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get('app.bsky.feed.getAuthorFeed', {
          params: {
            actor: toValue(actor) as ActorIdentifier,
            limit: 50,
            filter: 'posts_with_replies',
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: ONE_MINUTE,
    placeholderData: keepPreviousData,
  })
}

export function tagQuery(tag: MaybeRefOrGetter<string>) {
  return infiniteQueryOptions({
    queryKey: keyed('tag', tag),
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get('app.bsky.feed.searchPosts', {
          params: {
            q: `#${toValue(tag)}`,
            tag: [toValue(tag)],
            limit: 50,
            sort: 'latest',
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: ONE_MINUTE,
    placeholderData: keepPreviousData,
  })
}
