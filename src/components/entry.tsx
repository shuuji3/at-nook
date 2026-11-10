import type { AppBskyFeedDefs } from "@atcute/bluesky";
import { toEmbedView, toReplyView } from "../lib/embed";
import { splitTimestamp } from "../lib/format";
import { useRulingSnap } from "../lib/use-ruling-snap";
import { EmbedNote } from "./embed-note";

interface EntryProps {
  item: AppBskyFeedDefs.FeedViewPost;
  index: number;
}

const readRecord = (record: unknown): { text: string; createdAt?: string; facets?: unknown } => {
  if (typeof record !== "object" || record === null) {
    return { text: "" };
  }

  const fields = record as Record<string, unknown>;
  const createdAt =
    typeof fields.createdAt === "string" && !Number.isNaN(Date.parse(fields.createdAt))
      ? fields.createdAt
      : undefined;

  return {
    text: typeof fields.text === "string" ? fields.text : "",
    createdAt,
    facets: fields.facets,
  };
};

/** One dated diary entry: the writing, then whatever was pasted beside it. */
export const Entry = ({ item, index }: EntryProps) => {
  const post = item.post;
  const { text, createdAt } = readRecord(post.record);
  const stamp = createdAt ? splitTimestamp(createdAt) : null;
  const embed = toEmbedView(post.embed);
  const quote = embed?.kind === "quote" ? embed : null;
  const media = embed && embed.kind !== "quote" ? embed : null;
  const reply = toReplyView(item.reply);
  const embedRef = useRulingSnap<HTMLDivElement>();

  return (
    <article className="entry" data-entry={index}>
      {stamp ? (
        <time className="entry-time" dateTime={createdAt}>
          <span className="entry-date">{stamp.date}</span>
          <span className="entry-clock">{stamp.time}</span>
        </time>
      ) : null}

      <div className="entry-body">
        {reply ? <EmbedNote embed={reply} seed={post.uri} /> : null}
        {quote ? <EmbedNote embed={quote} seed={post.uri} /> : null}

        {text ? <p className="entry-text">{text}</p> : null}

        {media ? (
          <div className="entry-snap" ref={embedRef}>
            <EmbedNote embed={media} seed={post.uri} />
          </div>
        ) : null}
      </div>
    </article>
  );
};
