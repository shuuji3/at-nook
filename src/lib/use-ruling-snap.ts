import { useEffect, useRef } from "react";

/** must match --line-height in paper.css */
const RULING_PERIOD = 32;

/**
 * Pads the bottom of a variable-height block (photos, clippings) so its outer
 * height is a whole number of ruling lines, keeping the writing after it on the
 * ruling.
 */
export const useRulingSnap = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const snap = () => {
      element.style.marginBottom = "0px";
      const height = element.offsetHeight;
      const remainder = height % RULING_PERIOD;
      element.style.marginBottom = `${remainder === 0 ? 0 : RULING_PERIOD - remainder}px`;
    };

    const observer = new ResizeObserver(snap);
    observer.observe(element);
    snap();

    return () => observer.disconnect();
  }, []);

  return ref;
};
