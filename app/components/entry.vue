<template>
  <article ref="entryRef" class="entry" :data-entry="index">
    <a
      v-if="stamp"
      class="entry-time"
      :href="`https://bsky.app/profile/${post.author.handle}/post/${rkeyFromUri(post.uri)}`"
      target="_blank"
      rel="noreferrer"
    >
      <time :datetime="createdAt">
        <span v-if="showDate" class="entry-date">{{ stamp.date }}</span>
        <span class="entry-clock">{{ stamp.time }}</span>
      </time>
    </a>

    <div class="entry-body">
      <p v-if="showAuthor" class="entry-author">
        <NuxtLink
          v-if="post.author.displayName"
          class="note-quote-name"
          :to="profileHref(post.author.handle)"
        >
          {{ post.author.displayName }}
        </NuxtLink>
        <NuxtLink class="note-quote-handle" :to="profileHref(post.author.handle)">
          @{{ post.author.handle }}
        </NuxtLink>
      </p>

      <p v-if="replyTarget" class="entry-reply">
        <a
          :href="`https://bsky.app/profile/${replyTarget.handle}/post/${rkeyFromUri(replyTarget.uri)}`"
          target="_blank"
          rel="noreferrer"
        >
          @{{ replyTarget.handle }}
        </a>
        ({{ replyTarget.displayName }})
      </p>

      <EmbedNote v-if="quote" :embed="quote" :seed="post.uri" :post-day="postDay" />

      <p v-if="text" class="entry-text">
        <RichText :text="text" :facets="facets" />
      </p>

      <div v-if="media" ref="embedRef" class="entry-snap">
        <EmbedNote :embed="media" :seed="post.uri" :post-day="postDay" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { AppBskyFeedDefs } from "@atcute/bluesky";
import { toEmbedView, toReplyView } from "../utils/embed";
import { dayOf, profileHref, rkeyFromUri, splitTimestamp } from "../utils/format";
import { useRulingSnap } from "../composables/use-ruling-snap";

const props = withDefaults(
  defineProps<{
    item: AppBskyFeedDefs.FeedViewPost;
    index: number;
    showDate?: boolean;
    showAuthor?: boolean;
  }>(),
  { showDate: true, showAuthor: false },
);

const post = computed(() => props.item.post);

const readRecord = (record: unknown): { text: string; createdAt?: string; facets?: unknown } => {
  if (typeof record !== "object" || record === null) {
    return { text: "" };
  }
  const fields = record as Record<string, unknown>;
  const createdAt =
    typeof fields.createdAt === "string" && !Number.isNaN(Date.parse(fields.createdAt))
      ? fields.createdAt
      : undefined;
  return {
    text: typeof fields.text === "string" ? fields.text : "",
    createdAt,
    facets: fields.facets,
  };
};

const record = computed(() => readRecord(post.value.record));
const text = computed(() => record.value.text);
const createdAt = computed(() => record.value.createdAt);
const facets = computed(() => record.value.facets);
const stamp = computed(() =>
  createdAt.value ? splitTimestamp(createdAt.value) : null,
);
const embed = computed(() => toEmbedView(post.value.embed));
const quote = computed(() =>
  embed.value?.kind === "quote" ? embed.value : null,
);
const media = computed(() =>
  embed.value && embed.value.kind !== "quote" ? embed.value : null,
);
const reply = computed(() => toReplyView(props.item.reply));
const replyTarget = computed(() =>
  reply.value?.kind === "quote" ? reply.value : null,
);
const postDay = computed(() =>
  createdAt.value ? dayOf(createdAt.value) : undefined,
);

const embedRef = useRulingSnap<HTMLDivElement>();
const entryRef = useRulingSnap<HTMLElement>();
</script>
