import type { CSSProperties } from "react";
import type { EmbedImage } from "../lib/embed";
import { offsetFor, rotationFor, tapeHue, tapeTilt } from "../lib/format";

interface PhotoProps {
  image: EmbedImage;
  index: number;
  seed: string;
}

/** A photo taped into the page, tilted, nudged and taped deterministically per photo. */
export const Photo = ({ image, index, seed }: PhotoProps) => (
  <figure
    className="photo"
    style={
      {
        "--tilt": `${rotationFor(seed, index)}deg`,
        "--nudge": `${offsetFor(seed, index)}px`,
      } as CSSProperties
    }
  >
    <span
      className="photo-tape"
      aria-hidden="true"
      style={
        {
          "--tape-tilt": `${tapeTilt(seed, index)}deg`,
          "--tape-hue": tapeHue(seed, index),
        } as CSSProperties
      }
    />
    <img
      className="photo-image"
      src={image.fullsize}
      alt={image.alt}
      loading="lazy"
      decoding="async"
    />
    {image.alt ? <figcaption className="photo-caption">{image.alt}</figcaption> : null}
  </figure>
);
