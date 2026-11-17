export interface EmbedImage {
  fullsize: string
  thumb: string
  alt: string
  width?: number
  height?: number
}

export type EmbedView =
  | { kind: 'images'; images: EmbedImage[] }
  | {
      kind: 'video'
      thumbnail?: string
      playlist?: string
      alt?: string
      width?: number
      height?: number
    }
  | {
      kind: 'external'
      uri: string
      title: string
      description: string
      thumb?: string
    }
  | {
      kind: 'quote'
      variant: 'reply' | 'quote'
      uri: string
      handle: string
      displayName?: string
      createdAt?: string
      text: string
      facets?: unknown
      media?: EmbedView
    }
  | { kind: 'notFound' }
  | { kind: 'unsupported' }
  | null

export interface PostRecord {
  text: string
  createdAt?: string
  facets?: unknown
}

/**
 * Narrows an unvalidated post record to the fields the notebook renders.
 * Responses are trusted by the client, so every field is read defensively.
 */
export function toPostRecord(record: unknown): PostRecord {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function parseNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function toEmbedImage(value: unknown): EmbedImage {
  const image = isRecord(value) ? value : {}
  const aspectRatio = isRecord(image.aspectRatio) ? image.aspectRatio : {}

  return {
    fullsize: parseString(image.fullsize) ?? '',
    thumb: parseString(image.thumb) ?? '',
    alt: parseString(image.alt) ?? '',
    width: parseNumber(aspectRatio.width),
    height: parseNumber(aspectRatio.height),
  }
}

/** Turns a post's raw embed into the small shape the notebook knows how to draw. */
export function toEmbedView(embed: unknown): EmbedView {
  if (!isRecord(embed)) {
    return null
  }

  switch (embed.$type) {
    case 'app.bsky.embed.images#view': {
      const images = Array.isArray(embed.images) ? embed.images : []
      return { kind: 'images', images: images.map(toEmbedImage) }
    }

    case 'app.bsky.embed.video#view': {
      const aspectRatio = isRecord(embed.aspectRatio) ? embed.aspectRatio : {}
      return {
        kind: 'video',
        thumbnail: parseString(embed.thumbnail),
        playlist: parseString(embed.playlist),
        alt: parseString(embed.alt),
        width: parseNumber(aspectRatio.width),
        height: parseNumber(aspectRatio.height),
      }
    }

    case 'app.bsky.embed.external#view': {
      const external = isRecord(embed.external) ? embed.external : {}
      return {
        kind: 'external',
        uri: parseString(external.uri) ?? '',
        title: parseString(external.title) ?? '',
        description: parseString(external.description) ?? '',
        thumb: parseString(external.thumb),
      }
    }

    case 'app.bsky.embed.record#view':
      return toQuote(embed.record)

    case 'app.bsky.embed.recordWithMedia#view':
      return toQuote(embed.record)

    default:
      return { kind: 'unsupported' }
  }
}

function toQuote(record: unknown): EmbedView {
  if (!isRecord(record)) {
    return { kind: 'unsupported' }
  }

  if (record.$type === 'app.bsky.embed.record#viewNotFound') {
    return { kind: 'notFound' }
  }

  // TODO: distinguish blocked, detached, and non-post records (lists, feeds,
  // labelers, starter packs) instead of collapsing them into unsupported.
  if (record.$type !== 'app.bsky.embed.record#viewRecord') {
    return { kind: 'unsupported' }
  }

  const author = isRecord(record.author) ? record.author : {}
  const value = toPostRecord(record.value)

  return {
    kind: 'quote',
    variant: 'quote',
    uri: parseString(record.uri) ?? '',
    handle: parseString(author.handle) ?? '',
    displayName: parseString(author.displayName),
    createdAt: value.createdAt,
    text: value.text,
    facets: value.facets,
  }
}

/** Reads the post a feed item replies to, so it can be clipped into the entry. */
export function toReplyView(reply: unknown): EmbedView {
  if (!isRecord(reply)) {
    return null
  }

  const parent = reply.parent
  if (!isRecord(parent)) {
    return null
  }

  if (parent.$type === 'app.bsky.feed.defs#notFoundPost') {
    return { kind: 'notFound' }
  }

  // TODO: distinguish blocked replies from replies that are simply absent.
  if (parent.$type !== 'app.bsky.feed.defs#postView') {
    return null
  }

  const author = isRecord(parent.author) ? parent.author : {}
  const value = toPostRecord(parent.record)

  return {
    kind: 'quote',
    variant: 'reply',
    uri: parseString(parent.uri) ?? '',
    handle: parseString(author.handle) ?? '',
    displayName: parseString(author.displayName),
    createdAt: value.createdAt,
    text: value.text,
    facets: value.facets,
  }
}
