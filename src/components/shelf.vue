<template>
  <section class="shelf">
    <div class="notebook-root">
      <GroupSidebar :groups="groups" :selected="selected" @select="setSelected" />

      <div class="shelf-page">
        <div class="shelf-grid">
          <PersonTile
            v-for="profile in people"
            :key="profile.did"
            :profile="profile"
            :href="profileHref(profile.handle)"
          />
        </div>

        <p v-if="activeIsPending && !activeIsFetched" class="loading-note">
          finding notebooks…
        </p>
        <p v-else-if="activeIsError" class="shelf-note">
          the shelf could not be reached
        </p>
        <button
          v-if="activeHasNext"
          class="page-turn"
          type="button"
          :disabled="activeFetchingNext"
          @click="fetchNext"
        >
          more notebooks
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { ok } from "@atcute/client";
import type { ResourceUri } from "@atcute/lexicons";
import { profileHref } from "../lib/format";
import { followsQuery, listsQuery } from "../lib/queries";
import { rpc } from "../lib/rpc";
import { useSession } from "../lib/session";
import type { Group } from "./group-sidebar.vue";

const FIVE_MINUTES = 300_000;
const FOLLOWING = "following";

const { session } = useSession();
const selected = ref(FOLLOWING);
const sessionDid = () => session.value?.did ?? "";

const follows = useInfiniteQuery({
  ...followsQuery(sessionDid),
  enabled: () => Boolean(session.value),
});

const lists = useInfiniteQuery({
  ...listsQuery(sessionDid),
  enabled: () => Boolean(session.value),
});

const listKey = computed(() => [
  "list",
  selected.value === FOLLOWING ? "" : selected.value,
]);

const list = useInfiniteQuery({
  queryKey: listKey,
  queryFn: ({ pageParam }) =>
    ok(
      rpc().get("app.bsky.graph.getList", {
        params: {
          list: (selected.value === FOLLOWING ? "" : selected.value) as ResourceUri,
          limit: 50,
          cursor: pageParam,
        },
      }),
    ),
  enabled: () => Boolean(session.value) && selected.value !== FOLLOWING,
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (last: { cursor?: string }) => last.cursor,
  staleTime: FIVE_MINUTES,
});

const followsPeople = computed(() => follows.data.value?.pages.flatMap((page) => page.follows) ?? []);
const members = computed(
  () => list.data.value?.pages.flatMap((page) => page.items.map((item) => item.subject)) ?? [],
);

const curating = computed(() => selected.value !== FOLLOWING);
const people = computed(() => (curating.value ? members.value : followsPeople.value));

const curationLists = computed(
  () => lists.data.value?.pages.flatMap((page) => page.lists) ?? [],
);

const groups = computed<Group[]>(() => [
  { id: FOLLOWING, label: "following" },
  ...curationLists.value.map((entry: { uri: string; name: string; listItemCount?: number }) => ({
    id: entry.uri,
    label: entry.name,
    count: entry.listItemCount,
  })),
]);

const activeIsPending = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows;
  return q.isPending.value;
});

const activeIsFetched = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows;
  return q.isFetched.value;
});

const activeIsError = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows;
  return q.isError.value;
});

const activeHasNext = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows;
  return q.hasNextPage.value;
});

const activeFetchingNext = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows;
  return q.isFetchingNextPage.value;
});

const fetchNext = () => {
  const q = selected.value !== FOLLOWING ? list : follows;
  void q.fetchNextPage();
};

const setSelected = (id: string) => {
  selected.value = id;
};
</script>
