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
