import { profileHref } from "./format";

export type FacetKind = "link" | "mention" | "tag";

export interface FacetSegment {
  text: string;
  href?: string;
  kind?: FacetKind;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readFeature = (feature: unknown): { kind: FacetKind; href: string } | null => {
  if (!isRecord(feature)) {
    return null;
  }

  switch (feature.$type) {
    case "app.bsky.richtext.facet#link":
      return typeof feature.uri === "string" ? { kind: "link", href: feature.uri } : null;
    case "app.bsky.richtext.facet#mention":
      return typeof feature.did === "string"
        ? { kind: "mention", href: profileHref(feature.did) }
        : null;
    case "app.bsky.richtext.facet#tag":
      return typeof feature.tag === "string"
        ? { kind: "tag", href: `https://bsky.app/hashtag/${encodeURIComponent(feature.tag)}` }
        : null;
    default:
      return null;
  }
};

interface FacetRange {
  start: number;
  end: number;
  feature: { kind: FacetKind; href: string } | null;
}

const readRange = (facet: unknown): FacetRange | null => {
  if (!isRecord(facet)) {
    return null;
  }

  // facets carry their offsets under "index"; tolerate a flat shape too
  const index = isRecord(facet.index) ? facet.index : facet;
  const { byteStart, byteEnd } = index;
  if (typeof byteStart !== "number" || typeof byteEnd !== "number" || byteEnd <= byteStart) {
    return null;
  }

  const features = Array.isArray(facet.features) ? facet.features : [];
  const feature = features.map(readFeature).find((value) => value !== null) ?? null;

  return { start: byteStart, end: byteEnd, feature };
};

/**
 * Splits post text into plain and linked segments using the atproto byte-sliced
 * facets. Mentions, links, and tags all become anchors.
 */
export const toFacetSegments = (text: string, facets: unknown): FacetSegment[] => {
  if (!text) {
    return [];
  }

  const ranges = (Array.isArray(facets) ? facets : [])
    .map(readRange)
    .filter((range): range is FacetRange => range !== null)
    .sort((a, b) => a.start - b.start);

  if (ranges.length === 0) {
    return [{ text }];
  }

  const bytes = encoder.encode(text);
  const segments: FacetSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    const start = Math.max(cursor, Math.min(range.start, bytes.length));
    const end = Math.max(start, Math.min(range.end, bytes.length));
    if (start > cursor) {
      segments.push({ text: decoder.decode(bytes.slice(cursor, start)) });
    }

    const slice = decoder.decode(bytes.slice(start, end));
    segments.push(
      range.feature
        ? { text: slice, href: range.feature.href, kind: range.feature.kind }
        : { text: slice },
    );
    cursor = end;
  }

  if (cursor < bytes.length) {
    segments.push({ text: decoder.decode(bytes.slice(cursor)) });
  }

  return segments;
};
