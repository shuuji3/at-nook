import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { EmbedImage } from "../lib/embed";
import { offsetFor, rotationFor, tapeHue, tapeTilt } from "../lib/format";

interface PhotoProps {
  image: EmbedImage;
  index: number;
  seed: string;
}

/** A photo taped into the page; tap to enlarge it, tap again to put it back. */
export const Photo = ({ image, index, seed }: PhotoProps) => {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
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
        <button
          className="photo-button"
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={image.alt || "photo"}
        >
          <img
            className="photo-image"
            src={image.fullsize}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </button>
        {image.alt ? <figcaption className="photo-caption">{image.alt}</figcaption> : null}
      </figure>

      {zoomed
        ? createPortal(
            <button
              className="photo-zoom"
              type="button"
              aria-label="close photo"
              onClick={() => setZoomed(false)}
            >
              <img className="photo-zoom-image" src={image.fullsize} alt={image.alt} />
            </button>,
            document.body,
          )
        : null}
    </>
  );
};
