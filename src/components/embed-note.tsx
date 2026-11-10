import { Link } from "react-router";
import type { EmbedView } from "../lib/embed";
import { profileHref } from "../lib/format";
import { Photo } from "./photo";

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

    case "quote":
      return (
        <blockquote className="note note-quote">
          {embed.handle ? (
            <Link className="note-quote-author" to={profileHref(embed.handle)}>
              @{embed.handle}
            </Link>
          ) : null}
          {embed.text ? <p className="note-quote-text">{embed.text}</p> : null}
        </blockquote>
      );

    case "unsupported":
      return <p className="note note-unsupported">a clipping that could not be pasted</p>;
  }
};
