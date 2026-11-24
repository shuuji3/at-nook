<script setup lang="ts">
import { useInfiniteQuery } from '@tanstack/vue-query'
import type { Group } from '~/components/group-sidebar.vue'
import { PUBLIC_SHELF_DID } from '~/utils/endpoints'

const FOLLOWING = 'following'

const { session } = useSession()
const shelfDid = computed(() => session.value?.did ?? PUBLIC_SHELF_DID)
const selected = ref(FOLLOWING)
const follows = useInfiniteQuery({
  ...followsQuery(() => shelfDid.value),
  enabled: () => Boolean(shelfDid.value),
})

const lists = useInfiniteQuery({
  ...listsQuery(() => shelfDid.value),
  enabled: () => Boolean(shelfDid.value),
})

const listUri = computed(() => (selected.value === FOLLOWING ? '' : selected.value))

const list = useInfiniteQuery({
  ...listQuery(listUri),
  enabled: () => Boolean(shelfDid.value) && selected.value !== FOLLOWING,
})

const followsPeople = computed(
  () => follows.data.value?.pages.flatMap((page) => page.follows) ?? [],
)
const members = computed(
  () => list.data.value?.pages.flatMap((page) => page.items.map((item) => item.subject)) ?? [],
)

const curating = computed(() => selected.value !== FOLLOWING)
const people = computed(() => (curating.value ? members.value : followsPeople.value))

const curationLists = computed(() => lists.data.value?.pages.flatMap((page) => page.lists) ?? [])

const groups = computed<Group[]>(() => [
  { id: FOLLOWING, label: 'following' },
  ...curationLists.value.map((entry: { uri: string; name: string; listItemCount?: number }) => ({
    id: entry.uri,
    label: entry.name,
    count: entry.listItemCount,
  })),
])

const activeIsPending = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows
  return q.isPending.value
})

const activeIsFetched = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows
  return q.isFetched.value
})

const activeIsError = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows
  return q.isError.value
})

const activeHasNext = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows
  return q.hasNextPage.value
})

const activeFetchingNext = computed(() => {
  const q = selected.value !== FOLLOWING ? list : follows
  return q.isFetchingNextPage.value
})

function fetchNext() {
  const q = selected.value !== FOLLOWING ? list : follows
  void q.fetchNextPage()
}

function setSelected(id: string) {
  selected.value = id
}
</script>

<template>
  <section class="shelf">
    <div class="notebook-root">
      <GroupSidebar :groups="groups" :selected="selected" @select="setSelected" />

      <div class="shelf-page">
        <div class="shelf-frame">
          <div class="shelf-grid">
            <PersonTile
              v-for="profile in people"
              :key="profile.did"
              :profile="profile"
              :href="profileHref(profile.handle)"
            />
          </div>
        </div>

        <p v-if="activeIsPending && !activeIsFetched" class="loading-note">finding notebooks…</p>
        <p v-else-if="activeIsError" class="shelf-note">the shelf could not be reached</p>
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

<style scoped>
/* shelf of notebooks */
.shelf {
  min-height: 100vh;
  padding: 48px 24px 96px;
  background: var(--nook-cover-backdrop);
}

.notebook-root {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  width: min(100%, 1080px);
  margin-inline: auto;
  padding: 28px 28px 28px 40px;
  background: var(--paper);
  border-radius: 6px;
  box-shadow: 0 20px 44px rgba(43, 58, 85, 0.28);
}

.shelf-page {
  min-width: 0;
}

.shelf-title {
  margin: 0 0 28px;
  font-family: var(--font-hand);
  font-size: clamp(34px, 5vw, 54px);
  font-weight: 400;
  color: var(--ink);
}

.shelf-note {
  margin-top: 24px;
  font-family: var(--font-hand);
  font-size: 22px;
  color: var(--ink-soft);
}

/* the one way a page says it is still being fetched */
.loading-note {
  font-family: var(--font-hand);
  font-size: 22px;
  color: var(--ink-soft);
  text-align: center;
}

@media (max-width: 900px) {
  .notebook-root {
    grid-template-columns: 1fr;
    padding: 20px 16px;
  }
}

@media (max-width: 640px) {
  /* on a phone the shelf takes the whole width, so a book stays long enough
     for its own title and handle */
  .shelf {
    padding-inline: 0;
  }
}
</style>
