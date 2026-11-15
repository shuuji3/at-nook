<script lang="ts">
export interface TileProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}
</script>

<script setup lang="ts">

defineProps<{
  profile: TileProfile;
  href: string;
  caption?: string;
}>();
</script>

<template>
  <NuxtLink
    class="spine-row"
    :to="href"
    :style="{
      '--spine-hue': coverHue(profile.did),
      '--spine-shift': spineShift(profile.did),
    }"
  >
    <span class="spine-edge">
      <Avatar
        :src="profile.avatar"
        :alt="profile.displayName ?? profile.handle"
        :size="44"
        :viewable="false"
      />
    </span>
    <span class="spine-label">
      <span class="spine-name">{{ profile.displayName ?? profile.handle }}</span>
      <span class="spine-handle">@{{ profile.handle }}</span>
    </span>
    <span v-if="caption" class="spine-caption">{{ caption }}</span>
  </NuxtLink>
</template>
