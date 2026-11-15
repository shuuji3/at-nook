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

<style scoped>
/* a person as a book spine lying flat on the shelf */
.spine-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 68px;
  padding: 10px 20px 10px 12px;
  text-decoration: none;
  color: #f6ead8;
  border-radius: 4px;
  overflow: hidden;
  transform: translateX(calc(var(--spine-shift, 0) * 1rem));
  background-color: hsl(var(--spine-hue) 34% 42%);
  background-image:
    repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.04) 0 2px, transparent 2px 5px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.14));
  box-shadow: 0 2px 4px rgba(43, 58, 85, 0.26);
}

/* the spine slides a little further out when pointed at */
.spine-row:hover {
  transform: translateX(calc(var(--spine-shift, 0) * 1rem - 3rem));
  box-shadow: 0 6px 14px rgba(43, 58, 85, 0.32);
}

/* the lightly raised bands of a spine */
.spine-row::before,
.spine-row::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.22);
}

.spine-row::before {
  top: 9px;
}

.spine-row::after {
  bottom: 9px;
}

.spine-edge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  transform: rotate(-90deg);
}

.spine-label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  font-family: var(--font-hand);
  font-size: 25px;
  line-height: 1.15;
}

.spine-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spine-handle {
  font-size: 22px;
  color: rgba(246, 234, 216, 0.82);
  white-space: nowrap;
}

.spine-caption {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 14px;
  font-family: var(--font-hand);
  font-size: 18px;
  color: rgba(246, 234, 216, 0.82);
  white-space: nowrap;
}

@media (prefers-reduced-motion: no-preference) {
  .spine-row {
    transition:
      transform 140ms ease,
      box-shadow 140ms ease;
  }
}

@media (max-width: 640px) {
  /* compact book spines */
  .spine-row {
    min-height: 58px;
    padding: 8px 16px 8px 10px;
    transform: translateX(clamp(-1rem, calc(var(--spine-shift, 0) * 0.5rem), 1rem));
  }

  .spine-label {
    font-size: 21px;
  }

  .spine-handle {
    font-size: 16px;
  }
}
</style>
