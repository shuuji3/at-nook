<template>
  <NotebookShell>
    <template v-if="!session">
      <h1 class="page-note">
        open the notebook from the <NuxtLink to="/">cover</NuxtLink> first
      </h1>
    </template>

    <template v-else-if="notFound && !placeholderProfile">
      <h1 class="page-note">this notebook could not be found</h1>
    </template>

    <template v-else>
      <NotebookHeader v-if="headerProfile" :profile="headerProfile" />
      <div v-else class="notebook-skeleton">
        <p v-if="profile.isPending.value" class="page-note">finding the notebook…</p>
      </div>

      <div class="entries">
        <template v-if="entries.length > 0">
          <template v-for="({ item, showDate }, index) in dated" :key="item.post.uri">
            <Entry :item="item" :index="index" :show-date="showDate" />
          </template>
        </template>
      </div>

      <p v-if="!profile.data.value && feed.isPending.value" class="page-note">turning to the first page…</p>
      <p v-else-if="feed.isError.value" class="page-note">this page could not be read</p>
      <p v-else-if="profile.data.value && !feed.isPending.value && entries.length === 0 && !notFound" class="page-note">
        the rest of the notebook is empty
      </p>
      <button
        v-if="feed.hasNextPage.value"
        class="page-turn"
        type="button"
        :disabled="feed.isFetchingNextPage.value"
        @click="() => feed.fetchNextPage()"
      >
        turn the page
      </button>
    </template>
  </NotebookShell>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { authorFeedQuery, profileQuery } from "../../utils/queries";
import { documentTitle, dayOf } from "../../utils/format";
import { useSession } from "../../composables/use-session";

const { session } = useSession();

const route = useRoute();
const actor = computed(() => (route.params.actor as string) ?? "");

const profile = useQuery({
  ...profileQuery(actor),
  enabled: () => actor.value.length > 0,
});

const feed = useInfiniteQuery({
  ...authorFeedQuery(actor),
  enabled: () => actor.value.length > 0,
});

const title = computed(() =>
  profile.data.value
    ? documentTitle({
        displayName: profile.data.value.displayName,
        handle: profile.data.value.handle,
      })
    : undefined,
);

watch(title, (t) => {
  if (t) {
    document.title = t;
  }
});

const placeholderProfile = computed(() =>
  !profile.isPending.value && !profile.isError.value && profile.data.value ? profile.data.value : null,
);

const notFound = computed(() =>
  profile.isError.value || (!profile.isLoading.value && !profile.data.value),
);

const headerProfile = computed(() =>
  !session.value ? null : profile.isError.value ? null : profile.data.value ?? null,
);

const entries = computed(
  () =>
    (feed.data.value?.pages ?? [])
      .flatMap((page) => page.feed)
      .filter((item) => !item.reason),
);

// the date is written once per day; same-day entries only carry the time
const dated = computed(() => {
  let previousDay = "";
  return entries.value.map((item) => {
    const record = item.post.record as { createdAt?: unknown };
    const day = typeof record.createdAt === "string" ? dayOf(record.createdAt) : "";
    const showDate = day !== "" && day !== previousDay;
    previousDay = day;
    return { item, showDate };
  });
});
</script>
