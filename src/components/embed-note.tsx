import { Link } from "react-router";
import type { EmbedView } from "../lib/embed";
import { profileHref, splitTimestamp } from "../lib/format";
import { Photo } from "./photo";
import { RichText } from "./rich-text";

interface EmbedNoteProps {
  embed: EmbedView;
  seed: string;
}

/** Pins whatever a post carried — photos, a video still, a link, or a quote. */
export const EmbedNote = ({ embed, seed }: EmbedNoteProps) => {
  if (!embed) {
    return null;
  }

  switch (embed.kind) {
    case "images":
      return (
        <div className="photos">
          {embed.images.map((image, index) => (
            <Photo key={`${image.thumb}-${index}`} image={image} index={index} seed={seed} />
          ))}
        </div>
      );

    case "video":
      return embed.thumbnail ? (
        <figure className="photo photo-video">
          <img src={embed.thumbnail} alt="" loading="lazy" decoding="async" />
          <span className="photo-play" aria-hidden="true">
            ▶
          </span>
        </figure>
      ) : null;

    case "external":
      return (
        <a className="note note-external" href={embed.uri} target="_blank" rel="noreferrer">
          {embed.thumb ? (
            <img className="note-thumb" src={embed.thumb} alt="" loading="lazy" decoding="async" />
          ) : null}
          <span className="note-title">{embed.title || embed.uri}</span>
          {embed.description ? <span className="note-description">{embed.description}</span> : null}
        </a>
      );

    case "quote": {
      const stamp = embed.createdAt ? splitTimestamp(embed.createdAt) : null;

      return (
        <blockquote className={`note note-quote note-quote-${embed.variant}`}>
          {embed.handle ? (
            <p className="note-quote-author">
              <Link className="note-quote-name" to={profileHref(embed.handle)}>
                {embed.displayName ?? embed.handle}
              </Link>{" "}
              <span className="note-quote-handle">@{embed.handle}</span>
              {stamp ? (
                <time className="note-quote-time" dateTime={embed.createdAt}>
                  {`${stamp.date} ${stamp.time}`}
                </time>
              ) : null}
            </p>
          ) : null}
          {embed.text ? (
            <p className="note-quote-text">
              <RichText text={embed.text} facets={embed.facets} />
            </p>
          ) : null}
        </blockquote>
      );
    }

    case "unsupported":
      return <p className="note note-unsupported">a clipping that could not be pasted</p>;
  }
};
