import { ok } from "@atcute/client";
import type { ActorIdentifier, ResourceUri } from "@atcute/lexicons";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { rpc } from "./rpc";

const FIVE_MINUTES = 300_000;
const ONE_MINUTE = 60_000;

export const profileQuery = (actor: string) =>
  queryOptions({
    queryKey: ["profile", actor],
    queryFn: () =>
      ok(
        rpc.get("app.bsky.actor.getProfile", {
          params: { actor: actor as ActorIdentifier },
        }),
      ),
    staleTime: FIVE_MINUTES,
  });

export const followsQuery = (did: string) =>
  infiniteQueryOptions({
    queryKey: ["follows", did],
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get("app.bsky.graph.getFollows", {
          params: { actor: did as ActorIdentifier, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
  });

export const listsQuery = (did: string) =>
  infiniteQueryOptions({
    queryKey: ["lists", did],
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get("app.bsky.graph.getLists", {
          params: {
            actor: did as ActorIdentifier,
            purposes: ["curatelist"],
            limit: 50,
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
  });

export const listQuery = (uri: string) =>
  infiniteQueryOptions({
    queryKey: ["list", uri],
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get("app.bsky.graph.getList", {
          params: { list: uri as ResourceUri, limit: 50, cursor: pageParam },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: FIVE_MINUTES,
  });

export const authorFeedQuery = (actor: string) =>
  infiniteQueryOptions({
    queryKey: ["authorFeed", actor],
    queryFn: ({ pageParam }) =>
      ok(
        rpc.get("app.bsky.feed.getAuthorFeed", {
          params: {
            actor: actor as ActorIdentifier,
            limit: 50,
            filter: "posts_with_replies",
            cursor: pageParam,
          },
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor,
    staleTime: ONE_MINUTE,
  });
