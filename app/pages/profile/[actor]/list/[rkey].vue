<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { listUri, profileHref } from "../../../../utils/format";
import { listQuery, profileQuery } from "../../../../utils/queries";
import { useSession } from "../../../../composables/use-session";

const { session } = useSession();

const route = useRoute();
const actor = computed(() => (route.params.actor as string) ?? "");
const rkey = computed(() => (route.params.rkey as string) ?? "");

const profile = useQuery({
  ...profileQuery(actor),
  enabled: () => actor.value.length > 0,
});

const uri = computed(() => (profile.data.value ? listUri(profile.data.value.did, rkey.value) : ""));

const list = useInfiniteQuery({
  ...listQuery(uri),
  enabled: () => Boolean(uri.value),
});

const name = computed(
  () => (list.data.value?.pages[0]?.list.name) ?? "list",
);

const members = computed(
  () => (list.data.value?.pages ?? []).flatMap((page) => page.items.map((item) => item.subject)),
);
</script>

<template>
  <NotebookShell v-if="!session">
    <h1 class="page-note">
      open the notebook from the <NuxtLink to="/">cover</NuxtLink> first
    </h1>
  </NotebookShell>

  <NotebookShell v-else-if="profile.isPending.value">
    <p class="page-note">finding the notebook…</p>
  </NotebookShell>

  <NotebookShell v-else-if="profile.isError.value || !profile.data.value">
    <h1 class="page-note">this notebook could not be found</h1>
  </NotebookShell>

  <NotebookShell v-else>
    <template v-if="list.data.value">
      <h1 class="list-title">{{ name }}</h1>
      <p class="list-count">{{ members.length }} people</p>
    </template>

    <div class="shelf-grid">
      <PersonTile
        v-for="member in members"
        :key="member.did"
        :profile="member"
        :href="profileHref(member.handle)"
      />
    </div>

    <p v-if="list.isPending.value" class="page-note">finding people…</p>
    <p v-else-if="list.isError.value" class="page-note">this page is torn out</p>
    <p v-else-if="list.isSuccess.value && members.length === 0" class="page-note">
      this list is empty
    </p>
    <button
      v-if="list.hasNextPage.value"
      class="page-turn"
      type="button"
      :disabled="list.isFetchingNextPage.value"
      @click="() => list.fetchNextPage()"
    >
      more people
    </button>
  </NotebookShell>
</template>
