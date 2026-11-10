import type { AppBskyFeedDefs } from "@atcute/bluesky";
import { toEmbedView } from "../lib/embed";
import { splitTimestamp } from "../lib/format";
import { useRulingSnap } from "../lib/use-ruling-snap";
import { EmbedNote } from "./embed-note";

interface EntryProps {
  post: AppBskyFeedDefs.PostView;
  index: number;
}

const readRecord = (record: unknown): { text: string; createdAt?: string } => {
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
  };
};

/** One dated diary entry: the writing, then whatever was pasted beside it. */
export const Entry = ({ post, index }: EntryProps) => {
  const { text, createdAt } = readRecord(post.record);
  const stamp = createdAt ? splitTimestamp(createdAt) : null;
  const embed = toEmbedView(post.embed);
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
        {text ? <p className="entry-text">{text}</p> : null}
        {embed ? (
          <div className="embed-snap" ref={embedRef}>
            <EmbedNote embed={embed} seed={post.uri} />
          </div>
        ) : null}
      </div>
    </article>
  );
};
