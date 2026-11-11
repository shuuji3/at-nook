import { describe, expect, it } from "vite-plus/test";
import { toFacetSegments } from "./facets";

describe("toFacetSegments", () => {
  it("returns plain text when there are no facets", () => {
    expect(toFacetSegments("hello world", undefined)).toEqual([{ text: "hello world" }]);
  });

  it("splits a link facet", () => {
    const text = "see example.com now";
    const segments = toFacetSegments(text, [
      {
        byteStart: 4,
        byteEnd: 15,
        features: [{ $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }],
      },
    ]);

    expect(segments).toEqual([
      { text: "see " },
      { text: "example.com", href: "https://example.com", kind: "link" },
      { text: " now" },
    ]);
  });

  it("splits a link facet carried under index", () => {
    const text = "see example.com now";
    const segments = toFacetSegments(text, [
      {
        index: { byteStart: 4, byteEnd: 15 },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }],
      },
    ]);

    expect(segments).toEqual([
      { text: "see " },
      { text: "example.com", href: "https://example.com", kind: "link" },
      { text: " now" },
    ]);
  });

  it("splits a mention and a tag", () => {
    const text = "hi @alice.test #bluesky";
    const segments = toFacetSegments(text, [
      {
        byteStart: 3,
        byteEnd: 14,
        features: [{ $type: "app.bsky.richtext.facet#mention", did: "did:plc:a" }],
      },
      {
        byteStart: 15,
        byteEnd: 23,
        features: [{ $type: "app.bsky.richtext.facet#tag", tag: "bluesky" }],
      },
    ]);

    expect(segments[1]).toEqual({
      text: "@alice.test",
      href: "/profile/did%3Aplc%3Aa",
      kind: "mention",
    });
    expect(segments[3]).toEqual({
      text: "#bluesky",
      href: "/hashtag/bluesky",
      kind: "tag",
    });
  });

  it("slices multibyte text by byte offset", () => {
    const text = "こんにちは example.com";
    const linkStart = new TextEncoder().encode("こんにちは ").length;
    const segments = toFacetSegments(text, [
      {
        byteStart: linkStart,
        byteEnd: linkStart + 11,
        features: [{ $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }],
      },
    ]);

    expect(segments).toEqual([
      { text: "こんにちは " },
      { text: "example.com", href: "https://example.com", kind: "link" },
    ]);
  });

  it("ignores malformed facets without dropping text", () => {
    const segments = toFacetSegments("hello", [{ byteStart: 9, byteEnd: 2, features: [] }]);

    expect(segments).toEqual([{ text: "hello" }]);
  });
});
