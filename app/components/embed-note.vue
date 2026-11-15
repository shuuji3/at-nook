<template>
  <div v-if="!embed" />

  <div v-else-if="embed.kind === 'images'" class="photos">
    <Photo
      v-for="(image, index) in embed.images"
      :key="`${image.thumb}-${index}`"
      :image="image"
      :tilt="tilts[index] ?? 0"
      :nudge="nudges[index] ?? 0"
      :tape-tilt="tapes[index] ?? 0"
      :tape-hue="tapeHue(seed, index)"
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
    >
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

  <p v-else-if="embed.kind === 'unsupported'" class="note note-unsupported">
    a clipping that could not be pasted
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EmbedView } from "../utils/embed";
import { dayOf, pickSpread, profileHref, rkeyFromUri, splitTimestamp, tapeHue } from "../utils/format";

const props = defineProps<{
  embed: EmbedView;
  seed: string;
  postDay?: string;
}>();

const imageKeys = computed(() =>
  props.embed?.kind === "images" ? props.embed.images.map((i) => i.fullsize || i.thumb) : [],
);

const tilts = computed(() =>
  pickSpread(props.seed, imageKeys.value, { min: -2, max: 2, step: 0.1, gap: 0.6 }),
);

const nudges = computed(() =>
  pickSpread(`${props.seed}:nudge`, imageKeys.value, { min: -8, max: 8, step: 0.1, gap: 3 }),
);

const tapes = computed(() =>
  pickSpread(`${props.seed}:tape`, imageKeys.value, { min: -8, max: 8, step: 0.1, gap: 3 }),
);

const timestamp = computed(() => {
  if (props.embed?.kind !== "quote" || !props.embed.createdAt) return null;
  return splitTimestamp(props.embed.createdAt);
});

const sameDay = computed(() => {
  if (props.embed?.kind !== "quote" || !props.embed.createdAt || !props.postDay) return false;
  return dayOf(props.embed.createdAt) === props.postDay;
});
</script>
