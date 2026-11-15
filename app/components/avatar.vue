<script setup lang="ts">
withDefaults(defineProps<{
  src?: string;
  alt: string;
  size?: number;
  viewable?: boolean;
}>(), {
  size: 44,
  viewable: true,
});
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
    <img class="avatar" :src="src" alt="" loading="lazy" decoding="async" >
  </span>
  <PhotoViewer
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
