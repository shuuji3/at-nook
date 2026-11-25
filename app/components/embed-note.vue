<script setup lang="ts">
const props = defineProps<{
  embed: EmbedView
  seed: string
  postDay?: string
}>()

const imageKeys = computed(() =>
  props.embed?.kind === 'images' ? props.embed.images.map((i) => i.fullsize || i.thumb) : [],
)

const tilts = computed(() =>
  pickSpread(props.seed, imageKeys.value, { min: -2, max: 2, step: 0.1, gap: 0.6 }),
)

const nudges = computed(() =>
  pickSpread(`${props.seed}:nudge`, imageKeys.value, { min: -8, max: 8, step: 0.1, gap: 3 }),
)

const tapes = computed(() =>
  pickSpread(`${props.seed}:tape`, imageKeys.value, { min: -8, max: 8, step: 0.1, gap: 3 }),
)

const timestamp = computed(() => {
  if (props.embed?.kind !== 'quote' || !props.embed.createdAt) return null
  return splitTimestamp(props.embed.createdAt)
})

const sameDay = computed(() => {
  if (props.embed?.kind !== 'quote' || !props.embed.createdAt || !props.postDay) return false
  return dayOf(props.embed.createdAt) === props.postDay
})
</script>

<template>
  <div v-if="!embed" />

  <div v-else-if="embed.kind === 'images'" class="photos">
    <Photo
      v-for="(image, index) in embed.images"
      :key="`${image.thumb}-${index}`"
      :src="image.fullsize"
      :alt="image.alt"
      :width="image.width"
      :height="image.height"
      :tilt="tilts[index] ?? 0"
      :nudge="nudges[index] ?? 0"
      :tape-tilt="tapes[index] ?? 0"
      :tape-hue="tapeHue(seed, index)"
      :caption="image.alt"
    />
  </div>

  <VideoPrint
    v-else-if="embed.kind === 'video' && embed.thumbnail"
    :thumbnail="embed.thumbnail"
    :playlist="embed.playlist"
    :alt="embed.alt"
    :width="embed.width"
    :height="embed.height"
    :seed="seed"
  />

  <a
    v-else-if="embed.kind === 'external'"
    class="note note-external"
    :href="embed.uri"
    target="_blank"
    rel="noreferrer"
  >
    <span class="note-body">
      <span class="note-title">{{ embed.title || embed.uri }}</span>
      <span v-if="embed.description" class="note-description">{{ embed.description }}</span>
    </span>
    <img
      v-if="embed.thumb"
      class="note-thumb"
      :src="embed.thumb"
      alt=""
      loading="lazy"
      decoding="async"
    />
  </a>

  <blockquote
    v-else-if="embed.kind === 'quote'"
    :class="['note', 'note-quote', `note-quote-${embed.variant}`]"
  >
    <template v-if="embed.handle">
      <p class="note-quote-author">
        <span>
          quote from
          <template v-if="embed.displayName">
            <NuxtLink class="note-quote-name" :to="profileHref(embed.handle)">
              @{{ embed.handle }}
            </NuxtLink>
            ({{ embed.displayName }})
          </template>
        </span>
        <a
          v-if="timestamp"
          class="note-quote-time"
          :href="`https://bsky.app/profile/${embed.handle}/post/${rkeyFromUri(embed.uri)}`"
          target="_blank"
          rel="noreferrer"
        >
          <time :datetime="embed.createdAt">
            {{ sameDay ? timestamp.time : `${timestamp.date} ${timestamp.time}` }}
          </time>
        </a>
      </p>
    </template>
    <p v-if="embed.text" class="note-quote-text">
      <RichText :text="embed.text" :facets="embed.facets" />
    </p>
  </blockquote>

  <p v-else-if="embed.kind === 'notFound'" class="note note-unsupported">
    this post could not be found
  </p>

  <p v-else-if="embed.kind === 'unsupported'" class="note note-unsupported">
    a clipping that could not be pasted
  </p>
</template>

<style scoped>
.note {
  display: block;
  min-width: 0;
  margin: calc(var(--line-height) - 1.25rem) 0 calc(var(--line-height) - 0.75rem) 0;
  padding: 1.25rem 1rem 0.75rem;
  border-left: 3px solid var(--note-accent);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 12px rgba(43, 58, 85, 0.28);
  font-family: var(--font-hand);
  font-size: 20px;
  line-height: var(--line-height);
  color: var(--ink);
  text-decoration: none;
}

.note :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.note-external {
  display: flex;
  gap: var(--line-height);
  align-items: flex-start;
  flex-wrap: nowrap;
}

.note-body {
  display: grid;
  flex: 1 1 auto;
  min-width: 0;
}

.note-thumb {
  flex: 0 0 auto;
  width: 96px;
  height: 96px;
  object-fit: cover;
  order: 2;
}

.note-title {
  display: block;
  text-decoration: underline;
  overflow-wrap: anywhere;
}

.note-description {
  display: block;
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

.note-quote {
  margin: calc(var(--line-height) - 1.25rem) calc(-1 * var(--line-height))
    calc(var(--line-height) - 0.75rem) 0;
  padding: 1.25rem 1rem 0.75rem;
  border-left: 3px solid var(--ink-soft);
  background: rgba(255, 255, 255, 0.6);
}

.note-quote-reply {
  border-left-color: var(--indent-accent-color);
}

.note-quote-author {
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

.note-quote-time {
  color: var(--ink-soft);
}

.note-quote-time {
  flex: 0 0 auto;
}

.note-quote-text {
  margin: 0;
  overflow-wrap: anywhere;
}

.note-unsupported {
  color: var(--ink-soft);
  font-style: italic;
}

@media (min-width: 901px) {
  .note,
  .note-quote {
    max-width: 75%;
  }
}

@media (max-width: 640px) {
  .note-quote-author {
    font-size: 15px;
  }

  .note {
    margin-inline: calc(-1 * (1rem + 3px));
  }
}
</style>
