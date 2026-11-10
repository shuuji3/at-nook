import type { AppBskyFeedDefs } from "@atcute/bluesky";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { renderWithProviders } from "../test/render";
import { Entry } from "./entry";

const makePost = (record: unknown, embed?: unknown): AppBskyFeedDefs.PostView =>
  ({
    uri: "at://did:plc:a/app.bsky.feed.post/1",
    cid: "cid",
    author: { did: "did:plc:a", handle: "alice.test", displayName: "Alice" },
    indexedAt: "2026-11-08T12:33:58.545Z",
    record,
    embed,
  }) as unknown as AppBskyFeedDefs.PostView;

const imageEmbed = {
  $type: "app.bsky.embed.images#view",
  images: [
    {
      thumb: "t1",
      fullsize: "f1",
      alt: "first caption",
      aspectRatio: { width: 4, height: 3 },
    },
    { thumb: "t2", fullsize: "f2", alt: "second caption" },
    { thumb: "t3", fullsize: "f3", alt: "third caption" },
    { thumb: "t4", fullsize: "f4", alt: "fourth caption" },
  ],
};

describe("entry", () => {
  it("writes the text under the date, with taped photos captioned by alt text", () => {
    renderWithProviders(
      <Entry
        post={makePost({ text: "hello", createdAt: "2026-11-08T12:33:58.545Z" }, imageEmbed)}
        index={0}
      />,
    );

    expect(screen.getByText("hello")).toBeTruthy();
    expect(screen.getByText("nov 8, 2026")).toBeTruthy();
    expect(screen.getByText("12:33")).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(4);
    expect(screen.getByAltText("first caption")).toBeTruthy();
    expect(screen.getByText("fourth caption")).toBeTruthy();
  });

  it("renders an image-only post without text", () => {
    renderWithProviders(
      <Entry post={makePost({ createdAt: "2026-11-08T12:33:58.545Z" }, imageEmbed)} index={1} />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("keeps one very long url inside the entry", () => {
    const longUrl = `https://example.com/${"a".repeat(300)}`;

    renderWithProviders(
      <Entry
        post={makePost(
          { text: longUrl, createdAt: "2026-11-08T12:33:58.545Z" },
          {
            $type: "app.bsky.embed.external#view",
            external: { uri: longUrl, title: "long", description: "d" },
          },
        )}
        index={2}
      />,
    );

    expect(screen.getByText(longUrl)).toBeTruthy();
    expect(screen.getByRole("article")).toBeTruthy();
  });
});
