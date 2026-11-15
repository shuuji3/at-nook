<template>
  <PhotoViewer
    :src="image.fullsize"
    :alt="image.alt"
    :width="image.width"
    :height="image.height"
    :tilt="tilt"
    :caption="image.alt"
    :style="{
      '--nudge': `${nudge}px`,
      '--tape-tilt': `${tapeTilt}deg`,
      '--tape-hue': tapeHue,
    } as any"
  />
</template>

<script setup lang="ts">
import type { EmbedImage } from "../utils/embed";

defineProps<{
  image: EmbedImage;
  tilt: number;
  nudge: number;
  tapeTilt: number;
  tapeHue: number;
}>();
</script>
