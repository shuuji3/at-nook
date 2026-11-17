<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    alt: string
    size?: number
    viewable?: boolean
  }>(),
  {
    size: 44,
    viewable: true,
  },
)
</script>

<template>
  <span v-if="!src" class="avatar-print" :style="{ '--avatar-default': `${size}px` }">
    <span
      class="avatar avatar-fallback"
      :style="{ width: size + 'px', height: size + 'px' }"
      aria-hidden="true"
    >
      {{ (alt[0] ?? '?').toUpperCase() }}
    </span>
  </span>
  <span
    v-else-if="!viewable || size < 44"
    class="avatar-print"
    :style="{ '--avatar-default': `${size}px` }"
  >
    <img class="avatar" :src="src" alt="" loading="lazy" decoding="async" />
  </span>
  <Photo
    v-else
    :src="src"
    :alt="alt"
    :tape="false"
    :style="{
      width: size + 'px',
      maxWidth: size + 'px',
      padding: '4px',
      margin: '0',
    }"
  />
</template>

<style scoped>
.avatar-print {
  display: inline-grid;
  place-items: center;
  padding: 4px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(43, 58, 85, 0.28);
}

.avatar {
  display: block;
  background-color: var(--placeholder);
  width: var(--avatar-size, var(--avatar-default, 44px));
  height: var(--avatar-size, var(--avatar-default, 44px));
  object-fit: cover;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 20px;
  border: 1px solid rgba(43, 58, 85, 0.2);
}
</style>
