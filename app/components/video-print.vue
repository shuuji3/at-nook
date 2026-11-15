<template>
  <div class="photos">
    <figure class="photo" :style="{ '--tilt': `${rotationFor(seed, 0)}deg` }">
      <span
        class="photo-tape"
        aria-hidden="true"
        :style="{
          '--tape-tilt': `${tapeTilt(seed, 0)}deg`,
          '--tape-hue': tapeHue(seed, 0),
        }"
      />
      <template v-if="playing && playlist">
        <video
          ref="videoRef"
          class="photo-video"
          :poster="thumbnail"
          controls
          autoplay
          playsinline
        />
      </template>
      <template v-else>
        <button
          class="photo-button"
          type="button"
          :disabled="!playlist"
          :aria-label="label"
          @click="setPlaying(true)"
        >
          <img
            class="photo-image"
            :src="thumbnail"
            :alt="label"
            :width="width"
            :height="height"
            loading="lazy"
            decoding="async"
          >
          <span v-if="playlist" class="photo-play-mark" aria-hidden="true">▶</span>
        </button>
      </template>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { rotationFor, tapeHue, tapeTilt } from "../utils/format";

const props = defineProps<{
  thumbnail: string;
  playlist?: string;
  alt?: string;
  width?: number;
  height?: number;
  seed: string;
}>();

const playing = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);

const label = props.alt && props.alt.trim().length > 0 ? props.alt : "video";

const setPlaying = (value: boolean) => {
  playing.value = value;
};

watch([playing, () => props.playlist], ([isPlaying, pl]) => {
  const video = videoRef.value;
  if (!isPlaying || !pl || !video) return;

  // the url is an HLS playlist, which only Safari plays natively
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = pl;
    return;
  }

  let hls: { destroy: () => void } | null = null;
  let cancelled = false;

  void import("hls.js").then(({ default: Hls }) => {
    if (cancelled || !videoRef.value) return;
    if (Hls.isSupported()) {
      const instance = new Hls();
      instance.loadSource(pl);
      instance.attachMedia(videoRef.value);
      hls = instance;
    } else {
      videoRef.value.src = pl;
    }
  });

  // cleanup via watch's return
  return () => {
    cancelled = true;
    hls?.destroy();
  };
});
</script>
