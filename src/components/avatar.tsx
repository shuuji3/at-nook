import type { CSSProperties } from "react";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

/** A profile picture pasted in like a small print: white border, slight tilt, no tape. */
export const Avatar = ({ src, alt, size = 44 }: AvatarProps) => (
  <span className="avatar-print" style={{ "--avatar-default": `${size}px` } as CSSProperties}>
    {src ? (
      <img className="avatar" src={src} alt="" loading="lazy" decoding="async" />
    ) : (
      <span
        className="avatar avatar-fallback"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {(alt[0] ?? "?").toUpperCase()}
      </span>
    )}
  </span>
);
