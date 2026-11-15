<script setup lang="ts">
import { useInfiniteQuery } from "@tanstack/vue-query";

const route = useRoute();
const tag = computed(() => (route.params.tag as string) ?? "");

const posts = useInfiniteQuery({
  ...tagQuery(tag),
  enabled: () => tag.value.length > 0,
});

const items = computed(
  () => (posts.data.value?.pages ?? []).flatMap((page) => page.posts.map((post) => ({ post }))),
);
</script>

<template>
  <NotebookShell>
    <h1 class="list-title">#{{ tag }}</h1>

    <div class="entries">
      <Entry
        v-for="(item, index) in items"
        :key="item.post.uri"
        :item="item"
        :index="index"
        :show-author="true"
      />
    </div>

    <p v-if="posts.isPending.value" class="page-note">finding posts…</p>
    <p v-else-if="posts.isError.value" class="page-note">404 not found</p>
    <p v-else-if="posts.isSuccess.value && items.length === 0" class="page-note">
      nothing carries this tag
    </p>
    <button
      v-if="posts.hasNextPage.value"
      class="page-turn"
      type="button"
      :disabled="posts.isFetchingNextPage.value"
      @click="() => posts.fetchNextPage()"
    >
      turn the page
    </button>
  </NotebookShell>
</template>
