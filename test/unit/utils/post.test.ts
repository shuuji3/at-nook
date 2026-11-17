import { describe, expect, it } from 'vitest'
import { toEmbedView, toReplyView } from '../../../app/utils/post'

describe('toEmbedView', () => {
  it('returns null when there is no embed', () => {
    expect(toEmbedView(undefined)).toBeNull()
  })

  it('maps images with their aspect ratio', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.images#view',
        images: [
          {
            thumb: 't',
            fullsize: 'f',
            alt: 'alt text',
            aspectRatio: { width: 4, height: 3 },
          },
        ],
      }),
    ).toEqual({
      kind: 'images',
      images: [{ thumb: 't', fullsize: 'f', alt: 'alt text', width: 4, height: 3 }],
    })
  })

  it('maps a video thumbnail', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.video#view',
        thumbnail: 'v',
        aspectRatio: { width: 1, height: 1 },
      }),
    ).toEqual({
      kind: 'video',
      thumbnail: 'v',
      playlist: undefined,
      alt: undefined,
      width: 1,
      height: 1,
    })
  })

  it('maps an external link', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.external#view',
        external: { uri: 'https://x', title: 't', description: 'd' },
      }),
    ).toEqual({
      kind: 'external',
      uri: 'https://x',
      title: 't',
      description: 'd',
      thumb: undefined,
    })
  })

  it('maps a quoted post', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.record#view',
        record: {
          $type: 'app.bsky.embed.record#viewRecord',
          uri: 'at://q',
          author: { handle: 'q.test' },
          value: { text: 'quoted' },
        },
      }),
    ).toEqual({
      kind: 'quote',
      variant: 'quote',
      uri: 'at://q',
      handle: 'q.test',
      displayName: undefined,
      createdAt: undefined,
      text: 'quoted',
      facets: undefined,
    })
  })

  it('maps a reply target from the feed item', () => {
    expect(
      toReplyView({
        parent: {
          $type: 'app.bsky.feed.defs#postView',
          uri: 'at://p',
          author: { handle: 'p.test', displayName: 'Pat' },
          record: { text: 'parent text', createdAt: '2026-11-08T12:33:58.545Z' },
        },
      }),
    ).toEqual({
      kind: 'quote',
      variant: 'reply',
      uri: 'at://p',
      handle: 'p.test',
      displayName: 'Pat',
      createdAt: '2026-11-08T12:33:58.545Z',
      text: 'parent text',
      facets: undefined,
    })
    expect(toReplyView(undefined)).toBeNull()
    expect(toReplyView({ parent: { $type: 'app.bsky.feed.defs#notFoundPost' } })).toEqual({
      kind: 'notFound',
    })
  })

  it('reports a deleted record as not found', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.record#view',
        record: { $type: 'app.bsky.embed.record#viewNotFound', notFound: true },
      }),
    ).toEqual({ kind: 'notFound' })
  })

  it('marks records that cannot be shown as unsupported', () => {
    expect(
      toEmbedView({
        $type: 'app.bsky.embed.recordWithMedia#view',
        record: { record: { $type: 'unknown' } },
      }),
    ).toEqual({ kind: 'unsupported' })
    expect(toEmbedView({ $type: 'app.bsky.embed.record#view' })).toEqual({
      kind: 'unsupported',
    })
  })
})
