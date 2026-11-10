import { useState, type CSSProperties } from "react";
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

/** A photo taped into the page; tap to enlarge it, tap again to put it back. */
export const Photo = ({ image, tilt, nudge, tapeTilt, tapeHue }: PhotoProps) => {
  const [zoomed, setZoomed] = useState(false);

  const style = {
    "--tilt": `${tilt}deg`,
    "--nudge": `${nudge}px`,
    "--tape-tilt": `${tapeTilt}deg`,
    "--tape-hue": tapeHue,
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
