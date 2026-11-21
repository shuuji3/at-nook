<script setup lang="ts">
import type { AppBskyFeedDefs } from '@atcute/bluesky'

const props = withDefaults(
  defineProps<{
    item: AppBskyFeedDefs.FeedViewPost
    index: number
    showDate?: boolean
    showAuthor?: boolean
  }>(),
  { showDate: true, showAuthor: false },
)

const post = computed(() => props.item.post)

const record = computed(() => toPostRecord(post.value.record))
const text = computed(() => record.value.text)
const createdAt = computed(() => record.value.createdAt)
const facets = computed(() => record.value.facets)
const timestamp = computed(() => (createdAt.value ? splitTimestamp(createdAt.value) : null))
const embed = computed(() => toEmbedView(post.value.embed))
const quote = computed(() => (embed.value?.kind === 'quote' ? embed.value : null))
const media = computed(() => (embed.value && embed.value.kind !== 'quote' ? embed.value : null))
const reply = computed(() => toReplyView(props.item.reply))
const replyTarget = computed(() => (reply.value?.kind === 'quote' ? reply.value : null))
const postDay = computed(() => (createdAt.value ? dayOf(createdAt.value) : undefined))

const embedRef = useRulingSnap<HTMLDivElement>()
const entryRef = useRulingSnap<HTMLElement>()
</script>

<template>
  <article ref="entryRef" class="entry" :data-entry="index">
    <a
      v-if="timestamp"
      class="entry-time"
      :href="`https://bsky.app/profile/${post.author.handle}/post/${rkeyFromUri(post.uri)}`"
      target="_blank"
      rel="noreferrer"
    >
      <time :datetime="createdAt">
        <span v-if="showDate" class="entry-date">{{ timestamp.date }}</span>
        <span class="entry-clock">{{ timestamp.time }}</span>
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
        <NuxtLink class="note-quote-handle" :to="profileHref(replyTarget.handle)">
          @{{ replyTarget.handle }}
        </NuxtLink>
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

<style scoped>
.entry {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  align-items: start;
}

.entry-time time {
  display: flex;
  gap: 0 8px;
  white-space: nowrap;
}

.entry-time {
  display: grid;
  justify-self: start;
  align-content: start;
  padding-top: 0;
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: var(--line-height);
  color: var(--ink-soft);
  text-align: left;
}

.entry-body {
  display: grid;
  min-width: 0;
  padding: 0;
}

.entry-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.entry-reply {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 20px;
  line-height: var(--line-height);
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

.entry-reply a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.entry-author {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 0 0.5em;
  margin: 0;
  overflow: hidden;
  font-family: var(--font-hand);
  font-size: 17px;
  line-height: var(--line-height);
  color: var(--ink-soft);
  white-space: nowrap;
}

.entry-author :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .entry {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
