import type { AppBskyFeedDefs } from '@atcute/bluesky'
import { Link } from 'react-router'
import { toEmbedView, toReplyView } from '../lib/embed'
import { dayOf, profileHref, rkeyFromUri, splitTimestamp } from '../lib/format'
import { useRulingSnap } from '../lib/use-ruling-snap'
import { EmbedNote } from './embed-note'
import { RichText } from './rich-text'
interface EntryProps {
  item: AppBskyFeedDefs.FeedViewPost
  index: number
  showDate?: boolean
  /** pages that mix authors (a hashtag) need the author written above the entry */
  showAuthor?: boolean
}

const readRecord = (record: unknown): { text: string; createdAt?: string; facets?: unknown } => {
  if (typeof record !== 'object' || record === null) {
    return { text: '' }
  }

  const fields = record as Record<string, unknown>
  const createdAt =
    typeof fields.createdAt === 'string' && !Number.isNaN(Date.parse(fields.createdAt))
      ? fields.createdAt
      : undefined

  return {
    text: typeof fields.text === 'string' ? fields.text : '',
    createdAt,
    facets: fields.facets,
  }
}

/** One dated diary entry: the writing, then whatever was pasted beside it. */
export const Entry = ({ item, index, showDate = true, showAuthor = false }: EntryProps) => {
  const post = item.post
  const { text, createdAt, facets } = readRecord(post.record)
  const stamp = createdAt ? splitTimestamp(createdAt) : null
  const embed = toEmbedView(post.embed)
  const quote = embed?.kind === 'quote' ? embed : null
  const media = embed && embed.kind !== 'quote' ? embed : null
  const reply = toReplyView(item.reply)
  const replyTarget = reply?.kind === 'quote' ? reply : null
  const embedRef = useRulingSnap<HTMLDivElement>()
  const entryRef = useRulingSnap<HTMLElement>()
  const postDay = createdAt ? dayOf(createdAt) : undefined

  return (
    <article className="entry" data-entry={index} ref={entryRef}>
      {stamp ? (
        <a
          className="entry-time"
          href={`https://bsky.app/profile/${post.author.handle}/post/${rkeyFromUri(post.uri)}`}
          target="_blank"
          rel="noreferrer"
        >
          <time dateTime={createdAt}>
            {showDate ? <span className="entry-date">{stamp.date}</span> : null}
            <span className="entry-clock">{stamp.time}</span>
          </time>
        </a>
      ) : null}

      <div className="entry-body">
        {showAuthor ? (
          <p className="entry-author">
            {post.author.displayName ? (
              <Link className="note-quote-name" to={profileHref(post.author.handle)}>
                {post.author.displayName}
              </Link>
            ) : null}
            <Link className="note-quote-handle" to={profileHref(post.author.handle)}>
              @{post.author.handle}
            </Link>
          </p>
        ) : null}

        {replyTarget ? (
          <p className="entry-reply">
            <a
              href={`https://bsky.app/profile/${replyTarget.handle}/post/${rkeyFromUri(replyTarget.uri)}`}
              target="_blank"
              rel="noreferrer"
            >
              @{replyTarget.handle}
            </a>{' '}
            ({replyTarget.displayName})
          </p>
        ) : null}

        {quote ? <EmbedNote embed={quote} seed={post.uri} postDay={postDay} /> : null}

        {text ? (
          <p className="entry-text">
            <RichText text={text} facets={facets} />
          </p>
        ) : null}

        {media ? (
          <div className="entry-snap" ref={embedRef}>
            <EmbedNote embed={media} seed={post.uri} postDay={postDay} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
