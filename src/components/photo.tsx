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

  const style = {
    "--tilt": `${rotationFor(seed, index)}deg`,
    "--nudge": `${offsetFor(seed, index)}px`,
    "--tape-tilt": `${tapeTilt(seed, index)}deg`,
    "--tape-hue": tapeHue(seed, index),
  } as CSSProperties;

  const frame = (extra: string, content: React.ReactNode) => (
    <figure className={`photo ${extra}`} style={style}>
      <span className="photo-tape" aria-hidden="true" />
      {content}
      {image.alt ? <figcaption className="photo-caption">{image.alt}</figcaption> : null}
    </figure>
  );

  return (
    <>
      {frame(
        "",
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
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
        </button>,
      )}

      {zoomed
        ? createPortal(
            <div className="photo-zoom" role="dialog" aria-label="photo">
              {frame(
                "photo-enlarged",
                <img className="photo-image" src={image.fullsize} alt={image.alt} />,
              )}
              <button
                className="photo-zoom-close"
                type="button"
                aria-label="close photo"
                onClick={() => setZoomed(false)}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
