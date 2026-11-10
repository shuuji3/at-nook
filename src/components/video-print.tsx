import { useEffect, useRef, useState, type CSSProperties } from "react";
import { rotationFor, tapeHue, tapeTilt } from "../lib/format";

interface VideoPrintProps {
  thumbnail: string;
  playlist?: string;
  alt?: string;
  width?: number;
  height?: number;
  seed: string;
}

/** A video taped in like a print; tap to play it in place, no enlargement. */
export const VideoPrint = ({ thumbnail, playlist, alt, width, height, seed }: VideoPrintProps) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const caption = alt ? `[video] ${alt}` : "[video]";

  useEffect(() => {
    const video = videoRef.current;
    if (!playing || !playlist || !video) {
      return;
    }

    // the url is an HLS playlist, which only Safari plays natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlist;
      return;
    }

    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    void import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !videoRef.current) {
        return;
      }
      if (Hls.isSupported()) {
        const instance = new Hls();
        instance.loadSource(playlist);
        instance.attachMedia(videoRef.current);
        hls = instance;
      } else {
        videoRef.current.src = playlist;
      }
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [playing, playlist]);

  return (
    <div className="photos">
      <figure className="photo" style={{ "--tilt": `${rotationFor(seed, 0)}deg` } as CSSProperties}>
        <span
          className="photo-tape"
          aria-hidden="true"
          style={
            {
              "--tape-tilt": `${tapeTilt(seed, 0)}deg`,
              "--tape-hue": tapeHue(seed, 0),
            } as CSSProperties
          }
        />
        {playing && playlist ? (
          <video
            ref={videoRef}
            className="photo-video"
            poster={thumbnail}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <button
            className="photo-button"
            type="button"
            disabled={!playlist}
            onClick={() => setPlaying(true)}
            aria-label={caption}
          >
            <img
              className="photo-image"
              src={thumbnail}
              alt={caption}
              width={width}
              height={height}
              loading="lazy"
              decoding="async"
            />
            {playlist ? (
              <span className="photo-play-mark" aria-hidden="true">
                ▶
              </span>
            ) : null}
          </button>
        )}
        <figcaption className="photo-caption">{caption}</figcaption>
      </figure>
    </div>
  );
};
