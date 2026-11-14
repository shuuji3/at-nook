import { ok } from "@atcute/client";
import type { ActorIdentifier, ResourceUri } from "@atcute/lexicons";
import { infiniteQueryOptions, queryOptions } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { keepPreviousData } from "@tanstack/vue-query";
import { publicRpc, rpc } from "./rpc";

const FIVE_MINUTES = 300_000;
const ONE_MINUTE = 60_000;

/** A query key that re-reads its input, so route params stay live. */
const keyed = (prefix: string, input: MaybeRefOrGetter<string>) =>
  computed(() => [prefix, toValue(input)]);

/** Handle candidates for the cover's input. A public read, no session needed. */
export const actorCandidatesQuery = (q: MaybeRefOrGetter<string>) =>
  queryOptions({
    queryKey: keyed("actorCandidates", q),
    queryFn: () =>
      ok(
        publicRpc.get("app.bsky.actor.searchActorsTypeahead", {
          params: { q: toValue(q), limit: 8 },
        }),
      ),
    staleTime: ONE_MINUTE,
  });

export const profileQuery = (actor: MaybeRefOrGetter<string>) =>
  queryOptions({
    queryKey: keyed("profile", actor),
    queryFn: () =>
      ok(
        rpc().get("app.bsky.actor.getProfile", {
          params: { actor: toValue(actor) as ActorIdentifier },
        }),
      ),
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  });

export const followsQuery = (did: MaybeRefOrGetter<string>) =>
  infiniteQueryOptions({
    queryKey: keyed("follows", did),
    queryFn: ({ pageParam }) =>
      ok(
        rpc().get("app.bsky.graph.getFollows", {
          params: { actor: toValue(did) as ActorIdentifier, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  });

export const listsQuery = (did: MaybeRefOrGetter<string>) =>
  infiniteQueryOptions({
    queryKey: keyed("lists", did),
    queryFn: ({ pageParam }) =>
      ok(
        rpc().get("app.bsky.graph.getLists", {
          params: {
            actor: toValue(did) as ActorIdentifier,
            purposes: ["curatelist"],
            limit: 50,
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  });

export const listQuery = (uri: MaybeRefOrGetter<string>) =>
  infiniteQueryOptions({
    queryKey: keyed("list", uri),
    queryFn: ({ pageParam }) =>
      ok(
        rpc().get("app.bsky.graph.getList", {
          params: { list: toValue(uri) as ResourceUri, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  });

export const authorFeedQuery = (actor: MaybeRefOrGetter<string>) =>
  infiniteQueryOptions({
    queryKey: keyed("authorFeed", actor),
    queryFn: ({ pageParam }) =>
      ok(
        rpc().get("app.bsky.feed.getAuthorFeed", {
          params: {
            actor: toValue(actor) as ActorIdentifier,
            limit: 50,
            filter: "posts_with_replies",
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: ONE_MINUTE,
    placeholderData: keepPreviousData,
  });

export const tagQuery = (tag: MaybeRefOrGetter<string>) =>
  infiniteQueryOptions({
    queryKey: keyed("tag", tag),
    queryFn: ({ pageParam }) =>
      ok(
        rpc().get("app.bsky.feed.searchPosts", {
          params: {
            q: `#${toValue(tag)}`,
            tag: [toValue(tag)],
            limit: 50,
            sort: "latest",
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: ONE_MINUTE,
    placeholderData: keepPreviousData,
  });
