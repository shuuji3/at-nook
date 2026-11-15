<script setup lang="ts">
import type { AppBskyActorDefs } from "@atcute/bluesky";

const props = defineProps<{
  profile: AppBskyActorDefs.ProfileViewDetailed;
}>();

const name = computed(() => props.profile.displayName ?? props.profile.handle);
const bannerRef = useRulingSnap<HTMLDivElement>();

// descriptionFacets is not in the installed lexicon types but the AppView sends it
const descriptionFacets = computed(() => (props.profile as { descriptionFacets?: unknown }).descriptionFacets);
</script>

<template>
  <header class="notebook-header">
    <div
      ref="bannerRef"
      class="header-banner"
      :style="{ '--cover-hue': coverHue(profile.did) }"
    >
      <img v-if="profile.banner" :src="profile.banner" alt="" >
    </div>

    <div class="header-face">
      <span class="header-avatar">
        <Avatar :src="profile.avatar" :alt="name" :size="88" />
      </span>
      <div class="header-words">
        <div class="header-title">
          <span class="header-who">
            <h1 class="header-name">{{ name }}</h1>
            <span v-if="profile.pronouns" class="header-pronouns">{{ profile.pronouns }}</span>
          </span>
          <span class="header-handle">@{{ profile.handle }}</span>
        </div>
        <p v-if="profile.description" class="header-bio">
          <RichText :text="profile.description" :facets="descriptionFacets" />
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* pasted-in front of a notebook */
.notebook-header {
  margin: 0;
}

.header-banner {
  background: linear-gradient(120deg, hsl(var(--cover-hue) 40% 42%), hsl(var(--cover-hue) 35% 26%));
}

.header-banner img {
  display: block;
  width: 100%;
  height: auto;
}

.header-face {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
  padding: var(--line-height) var(--page-pad) var(--line-height) var(--text-pad);
}

.header-avatar {
  display: block;
}

.header-words {
  padding-bottom: 0;
}

.header-name {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 44px;
  font-weight: 400;
  line-height: var(--line-height);
  color: var(--ink);
}

.header-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.header-who {
  display: inline-flex;
  align-items: baseline;
  gap: 0 0.35em;
}

.header-handle {
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

.header-pronouns {
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink-soft);
}

.header-bio {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 20px;
  line-height: var(--line-height);
  color: var(--ink);
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .header-face {
    grid-template-columns: auto 1fr;
    gap: var(--line-height);
    align-items: start;
    margin-top: 0;
  }

  .header-words {
    display: contents;
  }

  .header-bio {
    grid-column: 1 / -1;
  }
}
</style>
