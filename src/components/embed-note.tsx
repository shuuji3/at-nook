import { Link } from "react-router";
import type { EmbedView } from "../lib/embed";
import { dayOf, profileHref, rkeyFromUri, splitTimestamp } from "../lib/format";
import { Photo } from "./photo";
import { RichText } from "./rich-text";
import { VideoPrint } from "./video-print";

interface EmbedNoteProps {
  embed: EmbedView;
  seed: string;
  /** the entry's own day, so a same-day quote does not repeat the date */
  postDay?: string;
}

/** Pins whatever a post carried — photos, a video still, a link, or a quote. */
export const EmbedNote = ({ embed, seed, postDay }: EmbedNoteProps) => {
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
        <VideoPrint
          thumbnail={embed.thumbnail}
          playlist={embed.playlist}
          alt={embed.alt}
          width={embed.width}
          height={embed.height}
          seed={seed}
        />
      ) : null;

    case "external":
      return (
        <a className="note note-external" href={embed.uri} target="_blank" rel="noreferrer">
          <span className="note-body">
            <span className="note-title">{embed.title || embed.uri}</span>
            {embed.description ? (
              <span className="note-description">{embed.description}</span>
            ) : null}
          </span>
          {embed.thumb ? (
            <img className="note-thumb" src={embed.thumb} alt="" loading="lazy" decoding="async" />
          ) : null}
        </a>
      );

    case "quote": {
      const stamp = embed.createdAt ? splitTimestamp(embed.createdAt) : null;
      const sameDay = Boolean(embed.createdAt && postDay && dayOf(embed.createdAt) === postDay);
      const href = profileHref(embed.handle);

      return (
        <blockquote className={`note note-quote note-quote-${embed.variant}`}>
          {embed.handle ? (
            <p className="note-quote-author">
              <span className="note-quote-who">
                {embed.displayName ? (
                  <>
                    <Link className="note-quote-name" to={href}>
                      {embed.displayName}
                    </Link>
                    <span className="note-quote-handle">@{embed.handle}</span>
                  </>
                ) : (
                  <Link className="note-quote-name" to={href}>
                    @{embed.handle}
                  </Link>
                )}
              </span>
              {stamp ? (
                <a
                  className="note-quote-time"
                  href={`https://bsky.app/profile/${embed.handle}/post/${rkeyFromUri(embed.uri)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <time dateTime={embed.createdAt}>
                    {sameDay ? stamp.time : `${stamp.date} ${stamp.time}`}
                  </time>
                </a>
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
