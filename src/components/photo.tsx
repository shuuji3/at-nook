import { type CSSProperties } from "react";
import type { EmbedImage } from "../lib/embed";
import { PhotoViewer } from "./photo-viewer";

interface PhotoProps {
  image: EmbedImage;
  /** per-photo values, spread apart within the post */
  tilt: number;
  nudge: number;
  tapeTilt: number;
  tapeHue: number;
}

/** A photo taped into the page; tapping it moves the print into the viewer. */
export const Photo = ({ image, tilt, nudge, tapeTilt, tapeHue }: PhotoProps) => (
  <PhotoViewer
    src={image.fullsize}
    alt={image.alt}
    width={image.width}
    height={image.height}
    tilt={tilt}
    caption={image.alt}
    style={
      {
        "--nudge": `${nudge}px`,
        "--tape-tilt": `${tapeTilt}deg`,
        "--tape-hue": tapeHue,
      } as CSSProperties
    }
  />
);
