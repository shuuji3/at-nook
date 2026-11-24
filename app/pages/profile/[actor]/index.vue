<script setup lang="ts">
import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'

const { ready } = useSession()

const route = useRoute()
const actor = computed(() => (route.params.actor as string) ?? '')

const profile = useQuery({
  ...profileQuery(actor),
  enabled: () => ready.value && actor.value.length > 0,
})

const feed = useInfiniteQuery({
  ...authorFeedQuery(actor),
  enabled: () => ready.value && actor.value.length > 0,
})

const title = computed(() =>
  profile.data.value
    ? documentTitle({
        displayName: profile.data.value.displayName,
        handle: profile.data.value.handle,
      })
    : undefined,
)

watch(title, (t) => {
  if (t) {
    document.title = t
  }
})

const placeholderProfile = computed(() =>
  !profile.isPending.value && !profile.isError.value && profile.data.value
    ? profile.data.value
    : null,
)

const notFound = computed(
  () => profile.isError.value || (!profile.isLoading.value && !profile.data.value),
)

const headerProfile = computed(() => (profile.isError.value ? null : (profile.data.value ?? null)))

const entries = computed(() =>
  (feed.data.value?.pages ?? []).flatMap((page) => page.feed).filter((item) => !item.reason),
)

// the date is written once per day; same-day entries only carry the time
const dated = computed(() => {
  let previousDay = ''
  return entries.value.map((item) => {
    const record = item.post.record as { createdAt?: unknown }
    const day = typeof record.createdAt === 'string' ? dayOf(record.createdAt) : ''
    const showDate = day !== '' && day !== previousDay
    previousDay = day
    return { item, showDate }
  })
})
</script>

<template>
  <NotebookShell>
    <template v-if="!ready">
      <!-- a stored session is resuming, so reads can use it -->
    </template>
    <template v-else-if="notFound && !placeholderProfile">
      <h1 class="page-note">this notebook could not be found</h1>
    </template>

    <template v-else>
      <NotebookHeader v-if="headerProfile" :profile="headerProfile" />

      <div class="entries">
        <template v-if="entries.length > 0">
          <template v-for="({ item, showDate }, index) in dated" :key="item.post.uri">
            <Entry :item="item" :index="index" :show-date="showDate" />
          </template>
        </template>
        <div v-else class="notebook-skeleton">
          <p v-if="!profile.data.value && feed.isPending.value" class="page-note">
            opening to the notebook…
          </p>
          <p v-else-if="feed.isError.value" class="page-note">this page could not be read</p>
          <p
            v-else-if="
              profile.data.value && !feed.isPending.value && entries.length === 0 && !notFound
            "
            class="page-note"
          >
            the rest of the notebook is empty
          </p>
        </div>
      </div>

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
