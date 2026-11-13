import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { EmbedImage } from "../lib/embed";

interface PhotoProps {
  image: EmbedImage;
  /** per-photo values, spread apart within the post */
  tilt: number;
  nudge: number;
  tapeTilt: number;
  tapeHue: number;
}

const MOVE_MS = 260;
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
  /** the padding that renders as the taped print's own padding under this pose */
  startPad: string;
  /** the viewer print's own padding, where the move settles */
  endPad: string;
  scaleY: number;
  /** the page caption's font size and line height, in px */
  pageFont: number;
  pageLine: number;
  /** the caption box height that renders as the page caption's own height */
  startCaptionH: number;
  /** the viewer caption's own height, where the box rests */
  endCaptionH: number;
  startCapMargin: number;
  endCapMargin: number;
}

type Phase = "closed" | "opening" | "open" | "closing";

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

/**
 * A photo taped into the page; tapping it moves the print into the viewer.
 *
 * The whole print travels — paper, picture and caption as one object. The two prints
 * are the same object at two sizes, so each axis gets its own scale: that maps one
 * box onto the other exactly, which a single scale cannot do because the padding is a
 * fixed length and the caption wraps at each print's own width.
 *
 * The viewer caption holds the caption twice — once at the page's size, once at the
 * viewer's — and the box height travels between the two heights while the two forms
 * cross-fade (the page form out over the first half, the viewer form in over the
 * second). The reflow between the two wraps therefore never shows, and the incoming
 * form is always drawn on the paper, not behind it.
 */
export const Photo = ({ image, tilt, nudge, tapeTilt, tapeHue }: PhotoProps) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const [staged, setStaged] = useState(false);
  const printRef = useRef<HTMLElement | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const style = {
    "--tilt": `${tilt}deg`,
    "--nudge": `${nudge}px`,
    "--tape-tilt": `${tapeTilt}deg`,
    "--tape-hue": tapeHue,
  } as CSSProperties;

  const printTape = () => printRef.current?.querySelector<HTMLElement>(".photo-tape") ?? null;

  /**
   * The move plan: the pose that puts the viewer print on the taped print, plus the
   * padding and caption box geometry that must go with it.
   *
   * A scale cannot carry a fixed length, so the fixed lengths are scaled the other way:
   * the viewer print is padded by the taped print's padding divided by the scale, and
   * the caption box starts at the page caption's height divided by the scale, so both
   * render as the taped print's own under the pose and ease back as the print grows.
   */
  const plan = useCallback((): Plan | null => {
    const print = printRef.current;
    const viewer = viewerRef.current;
    const printPicture = print?.querySelector<HTMLImageElement>(".photo-image");
    const viewerPicture = viewer?.querySelector<HTMLImageElement>(".photo-image");
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

    // the pictures are the same image, so equalising their boxes keeps picture and
    // paper one object
    const scaleX = printW / viewerW;
    const scaleY = printH / viewerH;

    const printStyle = getComputedStyle(print);
    const viewerStyle = getComputedStyle(viewer);
    const printPadX = parseFloat(printStyle.paddingLeft);
    const printPadY = parseFloat(printStyle.paddingTop);
    const viewerPadX = parseFloat(viewerStyle.paddingLeft);
    const viewerPadY = parseFloat(viewerStyle.paddingTop);

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
        // the padding is symmetric, so it never moves the centre
        dx: centre(from).x - centre(to).x,
        dy: centre(from).y - centre(to).y,
        scaleX,
        scaleY,
        rotate: tilt,
      },
      startPad: `${printPadY / scaleY}px ${printPadX / scaleX}px`,
      endPad: `${viewerPadY}px ${viewerPadX}px`,
      scaleY,
      pageFont,
      pageLine,
      startCaptionH: scaleY > 0 && pageCaptionH > 0 ? pageCaptionH / scaleY : viewerCaptionH,
      endCaptionH: viewerCaptionH,
      startCapMargin: scaleY > 0 ? pageMargin / scaleY : viewerMargin,
      endCapMargin: viewerMargin,
    };
  }, [tilt]);

  useLayoutEffect(() => {
    if (phase !== "opening") {
      return;
    }

    if (prefersReducedMotion()) {
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "1";
      }
      setStaged(false);
      setPhase("open");
      return;
    }

    let animation: Animation | null = null;
    let paddingAnimation: Animation | null = null;
    let tapeAnimation: Animation | null = null;
    const captionAnimations: Animation[] = [];

    const begin = (current: Plan) => {
      const card = viewerRef.current;
      if (!card) {
        return null;
      }

      const {
        pose,
        startPad,
        endPad,
        scaleY,
        pageFont,
        pageLine,
        startCaptionH,
        endCaptionH,
        startCapMargin,
        endCapMargin,
      } = current;

      // commit the taped pose — padding scaled up, so it renders as the taped
      // print's — then show the print that carries it
      card.style.padding = startPad;
      card.style.transform = poseTransform(pose);
      setStaged(false);

      const captionBox = card.querySelector<HTMLElement>(".photo-caption");
      const pageForm = card.querySelector<HTMLElement>(".photo-caption-page");
      const viewerForm = card.querySelector<HTMLElement>(".photo-caption-viewer");

      if (captionBox) {
        captionBox.style.height = `${startCaptionH}px`;
        captionBox.style.marginTop = `${startCapMargin}px`;
      }
      // the page form is the page caption's own size, carried under the pose
      if (pageForm) {
        pageForm.style.fontSize = `${pageFont / scaleY}px`;
        pageForm.style.lineHeight = `${pageLine / scaleY}px`;
      }

      const tape = printTape();
      const backdrop = backdropRef.current;

      animation = card.animate([{ transform: poseTransform(pose) }, { transform: "none" }], {
        duration: MOVE_MS,
        easing: EASE,
        fill: "forwards",
      });
      paddingAnimation = card.animate([{ padding: startPad }, { padding: endPad }], {
        duration: MOVE_MS,
        easing: EASE,
        fill: "forwards",
      });
      tapeAnimation =
        tape?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: MOVE_MS,
          easing: "linear",
          fill: "forwards",
        }) ?? null;
      backdrop?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: MOVE_MS,
        easing: "linear",
      });

      // the box travels between the two caption heights while the forms cross-fade
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
        // hold the page form at its own size while the card grows, so only the fade
        // moves it
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
          animation?.cancel();
          paddingAnimation?.cancel();
          for (const captionAnimation of captionAnimations) {
            captionAnimation.cancel();
          }
          card.style.transform = "";
          card.style.padding = "";
          if (captionBox) {
            captionBox.style.height = "";
            captionBox.style.marginTop = "";
          }
          if (pageForm) {
            pageForm.style.fontSize = "";
            pageForm.style.lineHeight = "";
          }
          // the backdrop has to stay once it is in
          if (backdrop) {
            backdrop.style.opacity = "1";
          }
          if (tape) {
            tape.style.opacity = "0";
          }
          setPhase("open");
        })
        .catch(() => undefined);

      return animation;
    };

    const current = plan();
    if (current) {
      setStaged(true);
      animation = begin(current);
      return () => {
        animation?.cancel();
        paddingAnimation?.cancel();
        tapeAnimation?.cancel();
        for (const captionAnimation of captionAnimations) {
          captionAnimation.cancel();
        }
      };
    }

    setPhase("open");
    return () => {
      animation?.cancel();
      paddingAnimation?.cancel();
      tapeAnimation?.cancel();
      for (const captionAnimation of captionAnimations) {
        captionAnimation.cancel();
      }
    };
  }, [phase, plan]);

  const close = useCallback(() => {
    if (phase !== "open") {
      return;
    }

    const current = plan();
    const card = viewerRef.current;

    if (!current || !card || prefersReducedMotion()) {
      setPhase("closed");
      return;
    }

    setPhase("closing");

    const {
      pose,
      startPad,
      endPad,
      scaleY,
      pageFont,
      pageLine,
      startCaptionH,
      endCaptionH,
      startCapMargin,
      endCapMargin,
    } = current;

    const backdrop = backdropRef.current;
    const print = printTape();
    const captionBox = card.querySelector<HTMLElement>(".photo-caption");
    const pageForm = card.querySelector<HTMLElement>(".photo-caption-page");
    const viewerForm = card.querySelector<HTMLElement>(".photo-caption-viewer");
    const captionAnimations: Animation[] = [];

    // the tape stays out of the way while the paper travels back over its place
    if (print) {
      print.style.opacity = "0";
    }

    card.style.transform = "none";
    card.animate([{ transform: "none" }, { transform: poseTransform(pose) }], {
      duration: MOVE_MS,
      easing: EASE,
      fill: "forwards",
    });
    card.style.padding = endPad;
    card.animate([{ padding: endPad }, { padding: startPad }], {
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
          [{ transform: `scale(${pose.scaleX}, ${pose.scaleY})` }, { transform: "none" }],
          { duration: MOVE_MS, easing: EASE, fill: "forwards" },
        ),
      );
      captionAnimations.push(
        pageForm.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: HALF_MS,
          delay: HALF_MS,
          easing: "linear",
          fill: "both",
        }),
      );
    }
    if (viewerForm) {
      captionAnimations.push(
        viewerForm.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: HALF_MS,
          easing: "linear",
          fill: "forwards",
        }),
      );
    }

    window.setTimeout(() => {
      // keep the page form's height until the viewer goes, so the box does not
      // collapse on the swap
      if (captionBox) {
        captionBox.style.height = `${startCaptionH}px`;
        captionBox.style.marginTop = `${startCapMargin}px`;
      }
      setPhase("closed");
      for (const captionAnimation of captionAnimations) {
        captionAnimation.cancel();
      }

      // only once the paper has landed does its tape come back, so the two never
      // overlap mid flight
      const tape = printTape();
      if (!tape) {
        return;
      }
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
        .catch(() => undefined);
    }, MOVE_MS);
  }, [phase, plan]);

  return (
    <>
      <figure
        className={phase !== "closed" ? "photo is-away" : "photo"}
        style={style}
        ref={printRef}
        data-photo="print"
      >
        <span className="photo-tape" aria-hidden="true" />
        <button
          className="photo-button"
          type="button"
          onClick={() => {
            if (phase === "closed") {
              setPhase("opening");
            }
          }}
          aria-label={image.alt || "photo"}
        >
          <img
            className="photo-image"
            src={image.fullsize}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
        </button>
        {image.alt ? (
          <figcaption className="photo-caption">
            <span className="photo-caption-text">{image.alt}</span>
          </figcaption>
        ) : null}
      </figure>

      {phase !== "closed"
        ? createPortal(
            <div className="photo-zoom" role="dialog" aria-label="photo" onClick={close}>
              <div className="photo-zoom-backdrop" ref={backdropRef} aria-hidden="true" />
              <figure
                className={staged ? "photo photo-enlarged is-staged" : "photo photo-enlarged"}
                style={style}
                ref={viewerRef}
                data-photo="viewer"
              >
                <img
                  className="photo-image"
                  src={image.fullsize}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                />
                {image.alt ? (
                  <figcaption className="photo-caption photo-caption-stacked">
                    <span className="photo-caption-text photo-caption-page">{image.alt}</span>
                    <span className="photo-caption-text photo-caption-viewer">{image.alt}</span>
                  </figcaption>
                ) : null}
              </figure>
              <button
                className="photo-zoom-close"
                type="button"
                aria-label="close photo"
                onClick={close}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
