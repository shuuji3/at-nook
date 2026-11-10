interface AvatarProps {
  src?: string;
  alt: string;
  size?: number;
}

/** A round print of a profile picture, or a paper stamp with the first letter. */
export const Avatar = ({ src, alt, size = 44 }: AvatarProps) => {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <span className="avatar avatar-fallback" style={style} aria-hidden="true">
        {(alt[0] ?? "?").toUpperCase()}
      </span>
    );
  }

  return <img className="avatar" style={style} src={src} alt="" loading="lazy" decoding="async" />;
};
