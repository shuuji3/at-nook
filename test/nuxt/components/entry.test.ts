import type { AppBskyFeedDefs } from '@atcute/bluesky'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import Entry from '~/components/entry.vue'

function makeItem(record: unknown, embed?: unknown, reply?: unknown): AppBskyFeedDefs.FeedViewPost {
  return {
    post: {
      uri: 'at://did:plc:a/app.bsky.feed.post/1',
      cid: 'cid',
      author: { did: 'did:plc:a', handle: 'alice.test', displayName: 'Alice' },
      indexedAt: '2026-11-08T12:33:58.545Z',
      record,
      embed,
    },
    reply,
  } as unknown as AppBskyFeedDefs.FeedViewPost
}

const imageEmbed = {
  $type: 'app.bsky.embed.images#view',
  images: [
    {
      thumb: 't1',
      fullsize: 'f1',
      alt: 'first caption',
      aspectRatio: { width: 4, height: 3 },
    },
    { thumb: 't2', fullsize: 'f2', alt: 'second caption' },
    { thumb: 't3', fullsize: 'f3', alt: 'third caption' },
    { thumb: 't4', fullsize: 'f4', alt: 'fourth caption' },
  ],
}

describe('entry', () => {
  it('writes the text under the date, with taped photos captioned by alt text', async () => {
    await renderWithProviders(Entry, {
      props: {
        item: makeItem({ text: 'hello', createdAt: '2026-11-08T12:33:58.545Z' }, imageEmbed),
        index: 0,
      },
    })

    expect(screen.getByText('hello')).toBeTruthy()
    expect(screen.getByText('2026-11-08 (Sun)')).toBeTruthy()
    expect(screen.getByText('12:33')).toBeTruthy()
    expect(screen.getAllByRole('img')).toHaveLength(4)
    expect(screen.getByAltText('first caption')).toBeTruthy()
    expect(screen.getByText('fourth caption')).toBeTruthy()
  })

  it('renders an image-only post without text', async () => {
    await renderWithProviders(Entry, {
      props: {
        item: makeItem({ createdAt: '2026-11-08T12:33:58.545Z' }, imageEmbed),
        index: 1,
      },
    })

    expect(screen.getAllByRole('img')).toHaveLength(4)
  })

  it('keeps one very long url inside the entry', async () => {
    const longUrl = `https://example.com/${'a'.repeat(300)}`

    await renderWithProviders(Entry, {
      props: {
        item: makeItem(
          { text: longUrl, createdAt: '2026-11-08T12:33:58.545Z' },
          {
            $type: 'app.bsky.embed.external#view',
            external: { uri: longUrl, title: 'long', description: 'd' },
          },
        ),
        index: 2,
      },
    })

    expect(screen.getByText(longUrl)).toBeTruthy()
    expect(screen.getByRole('article')).toBeTruthy()
  })

  it('links the reply target above the writing', async () => {
    await renderWithProviders(Entry, {
      props: {
        item: makeItem({ text: 'my reply', createdAt: '2026-11-08T12:33:58.545Z' }, undefined, {
          parent: {
            $type: 'app.bsky.feed.defs#postView',
            uri: 'at://did:plc:a/app.bsky.feed.post/9',
            author: { handle: 'p.test', displayName: 'Pat' },
            record: { text: 'parent text', createdAt: '2026-11-07T10:00:00.000Z' },
          },
        }),
        index: 3,
      },
    })

    expect(screen.getByRole('link', { name: '@p.test' })).toHaveAttribute(
      'href',
      'https://bsky.app/profile/p.test/post/9',
    )
    expect(screen.queryByText('parent text')).toBeNull()
    expect(screen.getByText('my reply')).toBeTruthy()
  })

  it('links whoever is mentioned in the writing', async () => {
    await renderWithProviders(Entry, {
      props: {
        item: makeItem({
          text: 'hi @alice.test',
          createdAt: '2026-11-08T12:33:58.545Z',
          facets: [
            {
              index: { byteStart: 3, byteEnd: 14 },
              features: [{ $type: 'app.bsky.richtext.facet#mention', did: 'did:plc:a' }],
            },
          ],
        }),
        index: 4,
      },
    })

    expect(screen.getByRole('link', { name: '@alice.test' })).toHaveAttribute(
      'href',
      '/profile/did%3Aplc%3Aa',
    )
  })
})
