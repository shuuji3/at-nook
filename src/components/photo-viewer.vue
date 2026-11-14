<template>
  <figure
    ref="printRef"
    :class="phase !== 'closed' ? 'photo is-away' : 'photo'"
    :style="{ ...style, '--tilt': `${tilt}deg` }"
    data-photo="print"
  >
    <span v-if="tape" class="photo-tape" aria-hidden="true" />
    <button
      class="photo-button"
      type="button"
      :aria-label="alt || 'photo'"
      @click="onOpen"
    >
      <img
        class="photo-image pv-image"
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
      >
    </button>
    <figcaption v-if="caption" class="photo-caption">
      <span class="photo-caption-text">{{ caption }}</span>
    </figcaption>
  </figure>

  <Teleport v-if="phase !== 'closed'" to="body">
    <div class="photo-zoom" role="dialog" aria-label="photo" @click="close">
      <div ref="backdropRef" class="photo-zoom-backdrop" aria-hidden="true" />
      <figure
        ref="viewerRef"
        :class="staged ? 'photo photo-enlarged is-staged' : 'photo photo-enlarged'"
        :style="{ '--tilt': `${tilt}deg` }"
        data-photo="viewer"
      >
        <img
          class="photo-image pv-image"
          :src="src"
          :alt="alt"
          :width="width"
          :height="height"
        >
        <figcaption v-if="caption" class="photo-caption photo-caption-stacked">
          <span class="photo-caption-text photo-caption-page">{{ caption }}</span>
          <span class="photo-caption-text photo-caption-viewer">{{ caption }}</span>
        </figcaption>
      </figure>
      <button
        class="photo-zoom-close"
        type="button"
        aria-label="close photo"
        @click="close"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
  type CSSProperties,
} from "vue";

const MOVE_MS = 300;
const HALF_MS = MOVE_MS / 2;
const TAPE_MS = 180;
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

interface Pose {
  dx: number;
  dy: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
}

interface Plan {
  pose: Pose;
  startPad: string;
  scaleY: number;
  pageFont: number;
  pageLine: number;
  startCaptionH: number;
  endCaptionH: number;
  startCapMargin: number;
  endCapMargin: number;
}

type Phase = "closed" | "opening" | "open" | "closing";

const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  tilt?: number;
  tape?: boolean;
  caption?: string;
  style?: CSSProperties;
}>(), {
  tilt: 0,
  tape: true,
});

const phase = ref<Phase>("closed");
const staged = ref(false);
const printRef = ref<HTMLElement | null>(null);
const viewerRef = ref<HTMLElement | null>(null);
const backdropRef = ref<HTMLDivElement | null>(null);

const centre = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const poseTransform = (pose: Pose) =>
  `translate(${pose.dx}px, ${pose.dy}px) scale(${pose.scaleX}, ${pose.scaleY}) rotate(${pose.rotate}deg)`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const printTape = (): HTMLElement | null =>
  printRef.value?.querySelector<HTMLElement>(".photo-tape") ?? null;

const plan = computed((): Plan | null => {
  const print = printRef.value;
  const viewer = viewerRef.value;
  const printPicture = print?.querySelector<HTMLImageElement>(".pv-image");
  const viewerPicture = viewer?.querySelector<HTMLImageElement>(".pv-image");
  if (!print || !viewer || !printPicture || !viewerPicture) {
    return null;
  }

  const printW = printPicture.offsetWidth;
  const printH = printPicture.offsetHeight;
  const viewerW = viewerPicture.offsetWidth;
  const viewerH = viewerPicture.offsetHeight;
  if (printW === 0 || printH === 0 || viewerW === 0 || viewerH === 0) {
    return null;
  }

  const scaleX = printW / viewerW;
  const scaleY = printH / viewerH;

  const printStyle = getComputedStyle(print);
  const printPadX = parseFloat(printStyle.paddingLeft);
  const printPadY = parseFloat(printStyle.paddingTop);

  const pageCaption = print.querySelector<HTMLElement>(".photo-caption");
  const viewerCaption = viewer.querySelector<HTMLElement>(".photo-caption-viewer");
  const viewerCaptionBox = viewer.querySelector<HTMLElement>(".photo-caption");
  const pageCaptionStyle = pageCaption ? getComputedStyle(pageCaption) : null;
  const viewerCaptionStyle = viewerCaptionBox ? getComputedStyle(viewerCaptionBox) : null;

  const pageCaptionH = pageCaption?.offsetHeight ?? 0;
  const viewerCaptionH = viewerCaption?.offsetHeight ?? 0;
  const pageFont = pageCaptionStyle ? parseFloat(pageCaptionStyle.fontSize) : 18;
  const pageLine = pageCaptionStyle ? parseFloat(pageCaptionStyle.lineHeight) : 32;
  const pageMargin = pageCaptionStyle ? parseFloat(pageCaptionStyle.marginTop) : 12;
  const viewerMargin = viewerCaptionStyle ? parseFloat(viewerCaptionStyle.marginTop) : 12;

  const from = print.getBoundingClientRect();
  const to = viewer.getBoundingClientRect();

  return {
    pose: {
      dx: centre(from).x - centre(to).x,
      dy: centre(from).y - centre(to).y,
      scaleX,
      scaleY,
      rotate: props.tilt,
    },
    startPad: `${printPadY / scaleY}px ${printPadX / scaleX}px`,
    scaleY,
    pageFont,
    pageLine,
    startCaptionH: scaleY > 0 && pageCaptionH > 0 ? pageCaptionH / scaleY : viewerCaptionH,
    endCaptionH: viewerCaptionH,
    startCapMargin: scaleY > 0 ? pageMargin / scaleY : viewerMargin,
    endCapMargin: viewerMargin,
  };
});

const onOpen = () => {
  if (phase.value === "closed") {
    phase.value = "opening";
  }
};

const close = () => {
  if (phase.value !== "open") return;

  const current = plan.value;
  const card = viewerRef.value;

  if (!current || !card || prefersReducedMotion()) {
    phase.value = "closed";
    return;
  }

  phase.value = "closing";

  const p = current.pose;
  const { scaleY, pageFont, pageLine, startCaptionH, endCaptionH, startCapMargin, endCapMargin } = current;
  const backdrop = backdropRef.value;
  const tapeEl = printTape();
  const captionBox = card.querySelector<HTMLElement>(".photo-caption");
  const pageForm = card.querySelector<HTMLElement>(".photo-caption-page");
  const viewerForm = card.querySelector<HTMLElement>(".photo-caption-viewer");
  const captionAnimations: Animation[] = [];

  if (tapeEl) {
    tapeEl.style.opacity = "0";
  }

  card.style.transform = "none";
  card.animate([{ transform: "none" }, { transform: poseTransform(p) }], {
    duration: MOVE_MS,
    easing: EASE,
    fill: "forwards",
  });
  backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: MOVE_MS,
    easing: "linear",
    fill: "forwards",
  });

  if (captionBox) {
    captionBox.style.height = `${endCaptionH}px`;
    captionBox.style.marginTop = `${endCapMargin}px`;
    captionAnimations.push(
      captionBox.animate(
        [
          { height: `${endCaptionH}px`, marginTop: `${endCapMargin}px` },
          { height: `${startCaptionH}px`, marginTop: `${startCapMargin}px` },
        ],
        { duration: MOVE_MS, easing: EASE, fill: "forwards" },
      ),
    );
  }
  if (pageForm) {
    pageForm.style.fontSize = `${pageFont / scaleY}px`;
    pageForm.style.lineHeight = `${pageLine / scaleY}px`;
    captionAnimations.push(
      pageForm.animate(
        [{ transform: `scale(${p.scaleX}, ${p.scaleY})` }, { transform: "none" }],
        { duration: MOVE_MS, easing: EASE, fill: "forwards" },
      ),
    );
    captionAnimations.push(
      pageForm.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: HALF_MS,
        easing: "linear",
        fill: "both",
      }),
    );
  }
  if (viewerForm) {
    captionAnimations.push(
      viewerForm.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: HALF_MS,
        easing: "linear",
        fill: "forwards",
      }),
    );
  }

  window.setTimeout(() => {
    if (captionBox) {
      captionBox.style.height = `${startCaptionH}px`;
      captionBox.style.marginTop = `${startCapMargin}px`;
    }
    for (const ca of captionAnimations) {
      ca.cancel();
    }
    phase.value = "closed";

    const tape = printTape();
    if (!tape) return;
    const tapeBack = tape.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: TAPE_MS,
      easing: "linear",
      fill: "forwards",
    });
    void tapeBack.finished
      .then(() => {
        tapeBack.cancel();
        tape.style.opacity = "";
      })
      .catch(() => {
        /* cleanup */
      });
  }, MOVE_MS);
};

// Opening animation — similar to the React useLayoutEffect
watch(phase, async (newPhase) => {
  if (newPhase !== "opening") return;

  if (prefersReducedMotion()) {
    if (backdropRef.value) {
      backdropRef.value.style.opacity = "1";
    }
    staged.value = false;
    phase.value = "open";
    return;
  }

  await nextTick();

  // Wait for the Teleported DOM to be available
  const current = plan.value;
  if (!current) {
    phase.value = "open";
    return;
  }

  const { pose, startPad, scaleY, pageFont, pageLine, startCaptionH, endCaptionH, startCapMargin, endCapMargin } = current;

  const card = viewerRef.value;
  if (!card) return;

  card.style.padding = startPad;
  card.style.transform = poseTransform(pose);
  staged.value = false;

  const captionBox = card.querySelector<HTMLElement>(".photo-caption");
  const pageForm = card.querySelector<HTMLElement>(".photo-caption-page");
  const viewerForm = card.querySelector<HTMLElement>(".photo-caption-viewer");
  const captionAnimations: Animation[] = [];

  if (captionBox) {
    captionBox.style.height = `${startCaptionH}px`;
    captionBox.style.marginTop = `${startCapMargin}px`;
  }
  if (pageForm) {
    pageForm.style.fontSize = `${pageFont / scaleY}px`;
    pageForm.style.lineHeight = `${pageLine / scaleY}px`;
  }

  const tapeEl = printTape();
  const backdrop = backdropRef.value;

  const animation = card.animate([{ transform: poseTransform(pose) }, { transform: "none" }], {
    duration: MOVE_MS,
    easing: EASE,
    fill: "forwards",
  });

  tapeEl?.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: MOVE_MS,
    easing: "linear",
    fill: "forwards",
  });

  backdrop?.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: MOVE_MS,
    easing: "linear",
  });

  if (captionBox) {
    captionAnimations.push(
      captionBox.animate(
        [
          { height: `${startCaptionH}px`, marginTop: `${startCapMargin}px` },
          { height: `${endCaptionH}px`, marginTop: `${endCapMargin}px` },
        ],
        { duration: MOVE_MS, easing: EASE, fill: "forwards" },
      ),
    );
  }
  if (pageForm) {
    captionAnimations.push(
      pageForm.animate(
        [{ transform: "none" }, { transform: `scale(${pose.scaleX}, ${pose.scaleY})` }],
        { duration: MOVE_MS, easing: EASE, fill: "forwards" },
      ),
    );
    captionAnimations.push(
      pageForm.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: HALF_MS,
        easing: "linear",
        fill: "forwards",
      }),
    );
  }
  if (viewerForm) {
    captionAnimations.push(
      viewerForm.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: HALF_MS,
        delay: HALF_MS,
        easing: "linear",
        fill: "both",
      }),
    );
  }

  void animation.finished
    .then(() => {
      animation.cancel();
      for (const ca of captionAnimations) {
        ca.cancel();
      }
      card.style.transform = "";
      if (captionBox) {
        captionBox.style.height = "";
        captionBox.style.marginTop = "";
      }
      if (pageForm) {
        pageForm.style.fontSize = "";
        pageForm.style.lineHeight = "";
      }
      if (backdrop) {
        backdrop.style.opacity = "1";
      }
      if (tapeEl) {
        tapeEl.style.opacity = "0";
      }
      phase.value = "open";
    })
    .catch(() => {
      /* cleanup on cancel */
    });
});
</script>
