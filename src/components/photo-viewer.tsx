import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface PhotoViewerProps {
  src: string;
  alt: string;
  /** optional image dimensions */
  width?: number;
  height?: number;
  /** whether to show the torn-tape thumbtack */
  tape?: boolean;
  /** styles applied to the inline figure */
  style?: CSSProperties;
  /** optional child rendered inside the print figure before the image button */
  children?: ReactNode;
}

const MOVE_MS = 300;
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
type Phase = "closed" | "opening" | "open" | "closing";

interface Pose {
  dx: number;
  dy: number;
  scaleX: number;
  scaleY: number;
}

const centre = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const poseTransform = (pose: Pose) =>
  `translate(${pose.dx}px, ${pose.dy}px) scale(${pose.scaleX}, ${pose.scaleY})`;

/** Wraps any image with a taped-print look and a traveling viewer. */
export const PhotoViewer = ({
  src,
  alt,
  width,
  height,
  tape = true,
  style,
  children,
}: PhotoViewerProps) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const [staged, setStaged] = useState(false);
  const printRef = useRef<HTMLElement | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const plan = useCallback((): Pose | null => {
    const printPic = printRef.current?.querySelector<HTMLImageElement>(".pv-image");
    const viewerPic = viewerRef.current?.querySelector<HTMLImageElement>(".pv-image");
    if (!printRef.current || !viewerRef.current || !printPic || !viewerPic) {
      return null;
    }

    const printW = printPic.offsetWidth;
    const printH = printPic.offsetHeight;
    const viewerW = viewerPic.offsetWidth;
    const viewerH = viewerPic.offsetHeight;
    if (printW === 0 || printH === 0 || viewerW === 0 || viewerH === 0) {
      return null;
    }

    const from = printRef.current.getBoundingClientRect();
    const to = viewerRef.current.getBoundingClientRect();

    return {
      dx: centre(from).x - centre(to).x,
      dy: centre(from).y - centre(to).y,
      scaleX: printW / viewerW,
      scaleY: printH / viewerH,
    };
  }, []);

  useLayoutEffect(() => {
    if (phase !== "opening") {
      return;
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if (backdropRef.current) backdropRef.current.style.opacity = "1";
      setStaged(false);
      setPhase("open");
      return;
    }

    let animation: Animation | null = null;

    const begin = (pose: Pose) => {
      const card = viewerRef.current;
      if (!card) return;

      card.style.transform = poseTransform(pose);
      setStaged(false);

      backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: MOVE_MS,
        easing: "linear",
      });

      animation = card.animate([{ transform: poseTransform(pose) }, { transform: "none" }], {
        duration: MOVE_MS,
        easing: EASE,
        fill: "forwards",
      });

      void animation.finished
        .then(() => {
          animation?.cancel();
          card.style.transform = "";
          if (backdropRef.current) backdropRef.current.style.opacity = "1";
          setPhase("open");
        })
        .catch(() => undefined);
    };

    const current = plan();
    if (current) {
      setStaged(true);
      begin(current);
      return () => animation?.cancel();
    }

    setPhase("open");
    return () => animation?.cancel();
  }, [phase, plan]);

  const close = useCallback(() => {
    if (phase !== "open") return;

    const card = viewerRef.current;
    const current = plan();
    if (
      !current ||
      !card ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      setPhase("closed");
      return;
    }

    setPhase("closing");
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: MOVE_MS,
      easing: "linear",
      fill: "forwards",
    });

    card.animate([{ transform: "none" }, { transform: poseTransform(current) }], {
      duration: MOVE_MS,
      easing: EASE,
      fill: "forwards",
    });

    window.setTimeout(() => setPhase("closed"), MOVE_MS);
  }, [phase, plan]);

  return (
    <>
      <figure
        className={phase !== "closed" ? "photo is-away" : "photo"}
        style={
          {
            ...style,
            "--tilt": "0deg",
            margin: 0,
          } as CSSProperties
        }
        ref={printRef}
        data-photo="print"
      >
        {tape ? <span className="photo-tape" aria-hidden="true" /> : null}
        {children}
        <button
          className="photo-button"
          type="button"
          onClick={() => {
            if (phase === "closed") setPhase("opening");
          }}
          aria-label={alt || "photo"}
        >
          <img
            className="photo-image pv-image"
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
          />
        </button>
      </figure>

      {phase !== "closed" &&
        createPortal(
          <div className="photo-zoom" role="dialog" aria-label="photo" onClick={close}>
            <div className="photo-zoom-backdrop" ref={backdropRef} aria-hidden="true" />
            <figure
              className={staged ? "photo photo-enlarged is-staged" : "photo photo-enlarged"}
              style={
                {
                  "--tilt": "0deg",
                  margin: 0,
                } as CSSProperties
              }
              ref={viewerRef}
              data-photo="viewer"
            >
              <img className="photo-image pv-image" src={src} alt={alt} />
            </figure>
            <button
              className="photo-zoom-close"
              type="button"
              aria-label="close photo"
              onClick={close}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
