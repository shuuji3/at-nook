<script setup lang="ts">
import type Hls from 'hls.js'

const props = defineProps<{
  thumbnail: string
  playlist?: string
  alt?: string
  width?: number
  height?: number
  seed: string
}>()

const playing = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

const label = props.alt?.trim() ? props.alt : 'video'

function setPlaying(value: boolean) {
  playing.value = value
}

watch([playing, () => props.playlist], ([isPlaying, pl]) => {
  const video = videoRef.value
  if (!isPlaying || !pl || !video) return

  // the url is an HLS playlist, which only Safari plays natively
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = pl
    return
  }

  let hls: Hls | null = null
  let cancelled = false

  void import('hls.js').then(({ default: Hls }) => {
    if (cancelled || !videoRef.value) return
    if (Hls.isSupported()) {
      const instance = new Hls()
      instance.loadSource(pl)
      instance.attachMedia(videoRef.value)
      hls = instance
    } else {
      videoRef.value.src = pl
    }
  })

  return () => {
    cancelled = true
    hls?.destroy()
  }
})
</script>

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
          />
          <span v-if="playlist" class="photo-play-mark" aria-hidden="true">▶</span>
        </button>
      </template>
    </figure>
  </div>
</template>

<style scoped>
.photo-video {
  display: block;
  width: 100%;
  height: auto;
  background: #000;
}

.photo-play-mark {
  position: absolute;
  inset: 40px 14px 10px;
  display: grid;
  place-items: center;
  font-size: 34px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.photo-button:has(.photo-play-mark) {
  position: relative;
  cursor: pointer;
}
</style>
