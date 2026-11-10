import type { CSSProperties } from "react";
import type { EmbedImage } from "../lib/embed";
import { rotationFor } from "../lib/format";

interface PhotoProps {
  image: EmbedImage;
  index: number;
  seed: string;
}

/** A photo taped into the page, tilted deterministically so every visit matches. */
export const Photo = ({ image, index, seed }: PhotoProps) => (
  <figure className="photo" style={{ "--tilt": `${rotationFor(seed, index)}deg` } as CSSProperties}>
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
