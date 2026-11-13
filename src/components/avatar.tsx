import type { CSSProperties } from "react";
import { PhotoViewer } from "./photo-viewer";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
  /** when false, the image is not expanded on click */
  viewable?: boolean;
}

/** A profile picture pasted in like a small print; when large enough tap‑to‑view works. */
export const Avatar = ({ src, alt, size = 44, viewable = true }: AvatarProps) => {
  if (!src) {
    return (
      <span className="avatar-print" style={{ "--avatar-default": `${size}px` } as CSSProperties}>
        <span
          className="avatar avatar-fallback"
          style={{ width: size, height: size }}
          aria-hidden="true"
        >
          {(alt[0] ?? "?").toUpperCase()}
        </span>
      </span>
    );
  }

  if (!viewable || size < 44) {
    return (
      <span className="avatar-print" style={{ "--avatar-default": `${size}px` } as CSSProperties}>
        <img className="avatar" src={src} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }

  return (
    <PhotoViewer
      src={src}
      alt={alt}
      tape={false}
      style={
        {
          width: size,
          maxWidth: size,
          padding: "4px",
          margin: 0,
        } as CSSProperties
      }
    />
  );
};
