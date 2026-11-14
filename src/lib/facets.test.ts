import { describe, expect, it } from "vitest";
import { toFacetSegments } from "./facets";

const facet = (byteStart: number, byteEnd: number, feature: unknown) => ({
  index: { byteStart, byteEnd },
  features: [feature],
});

describe("toFacetSegments", () => {
  it("returns plain text when there are no facets", () => {
    expect(toFacetSegments("hello world", undefined)).toEqual([{ text: "hello world" }]);
  });

  it("splits a link facet", () => {
    const segments = toFacetSegments("see example.com now", [
      facet(4, 15, { $type: "app.bsky.richtext.facet#link", uri: "https://example.com" }),
    ]);

    expect(segments).toEqual([
      { text: "see " },
      { text: "example.com", href: "https://example.com", kind: "link" },
      { text: " now" },
    ]);
  });

  it("splits a mention and a tag", () => {
    const segments = toFacetSegments("hi @alice.test #bluesky", [
      facet(3, 14, { $type: "app.bsky.richtext.facet#mention", did: "did:plc:a" }),
      facet(15, 23, { $type: "app.bsky.richtext.facet#tag", tag: "bluesky" }),
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
    const start = new TextEncoder().encode("こんにちは ").length;
    const segments = toFacetSegments(text, [
      facet(start, start + 11, {
        $type: "app.bsky.richtext.facet#link",
        uri: "https://example.com",
      }),
    ]);

    expect(segments).toEqual([
      { text: "こんにちは " },
      { text: "example.com", href: "https://example.com", kind: "link" },
    ]);
  });

  it("keeps text whole when a facet is unknown", () => {
    const segments = toFacetSegments("hello", [
      facet(0, 5, { $type: "app.bsky.richtext.facet#unknown" }),
    ]);

    expect(segments).toEqual([{ text: "hello" }]);
  });
});
