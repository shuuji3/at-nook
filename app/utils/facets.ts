import { segmentize, type Facet } from '@atcute/bluesky-richtext-segmenter'
import { profileHref } from '~/utils/format'

export type FacetKind = 'link' | 'mention' | 'tag'

export interface FacetSegment {
  text: string
  href?: string
  kind?: FacetKind
}

/** The facet types the notebook turns into anchors. */
type FacetFeature = {
  $type?: string
  uri?: string
  did?: string
  tag?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readFeature(feature: unknown): { kind: FacetKind; href: string } | null {
  if (!isRecord(feature)) {
    return null
  }

  const { $type, uri, did, tag } = feature as FacetFeature

  switch ($type) {
    case 'app.bsky.richtext.facet#link':
      return typeof uri === 'string' ? { kind: 'link', href: uri } : null
    case 'app.bsky.richtext.facet#mention':
      return typeof did === 'string' ? { kind: 'mention', href: profileHref(did) } : null
    case 'app.bsky.richtext.facet#tag':
      return typeof tag === 'string'
        ? { kind: 'tag', href: `/hashtag/${encodeURIComponent(tag)}` }
        : null
    default:
      return null
  }
}

/**
 * Splits post text with atcute's richtext segmenter and maps each facet to the
 * anchor the notebook draws it as.
 */
export function toFacetSegments(text: string, facets: unknown): FacetSegment[] {
  return segmentize(text, Array.isArray(facets) ? (facets as Facet[]) : undefined).map(
    (segment) => {
      const feature = segment.features?.map(readFeature).find((value) => value !== null) ?? null

      return feature
        ? { text: segment.text, href: feature.href, kind: feature.kind }
        : { text: segment.text }
    },
  )
}
