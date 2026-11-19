<script lang="ts">
export interface TileProfile {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}
</script>

<script setup lang="ts">
const { profile } = defineProps<{
  profile: TileProfile
  href: string
}>()

/** The book's random extra height in whole rem, from the old spine shift's math. */
const spineExtra = computed(() => spineHeight(profile.did))
</script>

<template>
  <span class="book-slot">
    <span class="book-frame">
      <NuxtLink class="spine-row" :to="href" :style="{ '--spine-hue': coverHue(profile.did) }">
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
      </NuxtLink>
    </span>
  </span>
</template>

<style scoped>
/* the shelf cell a book stands in: reserves a row and sets the book's foot on the board */
.book-slot {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: var(--shelf-row);
  padding-bottom: var(--shelf-board, 10px);
}

/* the shelf cell a book stands in: a real upright box, width = spine thickness,
   height = book length, standing on the board. no rotation lives here. */
.book-frame {
  position: relative;
  display: block;
  flex: 0 0 auto;
  --spine-height: v-bind(spineExtra);
  /* the shelf's width plus the old shift's whole-rem extra, so a book is only ever taller */
  --book-length: calc(var(--shelf-width) + var(--spine-height, 0) * 1rem);
  width: var(--book-thickness, 72px);
  height: var(--book-length);
}

/* the book lifts straight up off the shelf bar when pointed at, held, or tapped */
.book-frame:hover,
.book-frame:active,
.book-frame:has(.spine-row:active) {
  transform: translateY(-1.5rem);
}

/* the spine content laid out along the book's long axis, then turned upright to
   fill the vertical frame; the rotation lives here so the frame stays vertical */
.spine-row {
  position: absolute;
  top: calc(50% - var(--book-thickness, 72px) / 2);
  left: calc(50% - var(--book-length) / 2);
  width: var(--book-length);
  height: var(--book-thickness, 72px);
  transform: rotate(90deg);
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 68px;
  padding: 10px 20px 10px 12px;
  text-decoration: none;
  color: #f6ead8;
  border-radius: 4px;
  overflow: hidden;
  background-color: hsl(var(--spine-hue) 34% 42%);
  background-image:
    repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.04) 0 2px, transparent 2px 5px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.14));
  box-shadow: 0 2px 4px rgba(43, 58, 85, 0.26);
}

/* the spine is pulled clear of its neighbours when pointed at */
.spine-row:hover {
  box-shadow: 0 6px 14px rgba(43, 58, 85, 0.32);
}

/* the lightly raised bands of a spine */
.spine-row::before,
.spine-row::after {
  content: '';
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
  /* the imprint sits at the spine's foot, away from the name */
  margin-left: auto;
  font-size: 22px;
  color: rgba(246, 234, 216, 0.82);
  white-space: nowrap;
}

@media (prefers-reduced-motion: no-preference) {
  .spine-row {
    transition:
      transform 140ms ease,
      box-shadow 140ms ease;
  }

  .book-frame {
    transition: transform 140ms ease;
  }
}

@media (max-width: 640px) {
  /* compact book spines; 4px vertical padding keeps the band at exactly the 60px column width */
  .spine-row {
    min-height: 58px;
    padding: 4px 16px 4px 10px;
  }

  .spine-label {
    font-size: 21px;
  }

  .spine-handle {
    font-size: 16px;
  }
}
</style>
