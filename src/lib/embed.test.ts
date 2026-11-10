import { describe, expect, it } from "vite-plus/test";
import { toEmbedView } from "./embed";

describe("toEmbedView", () => {
  it("returns null when there is no embed", () => {
    expect(toEmbedView(undefined)).toBeNull();
  });

  it("maps images with their aspect ratio", () => {
    expect(
      toEmbedView({
        $type: "app.bsky.embed.images#view",
        images: [
          {
            thumb: "t",
            fullsize: "f",
            alt: "alt text",
            aspectRatio: { width: 4, height: 3 },
          },
        ],
      }),
    ).toEqual({
      kind: "images",
      images: [{ thumb: "t", fullsize: "f", alt: "alt text", width: 4, height: 3 }],
    });
  });

  it("maps a video thumbnail", () => {
    expect(
      toEmbedView({
        $type: "app.bsky.embed.video#view",
        thumbnail: "v",
        aspectRatio: { width: 1, height: 1 },
      }),
    ).toEqual({ kind: "video", thumbnail: "v" });
  });

  it("maps an external link", () => {
    expect(
      toEmbedView({
        $type: "app.bsky.embed.external#view",
        external: { uri: "https://x", title: "t", description: "d" },
      }),
    ).toEqual({
      kind: "external",
      uri: "https://x",
      title: "t",
      description: "d",
      thumb: undefined,
    });
  });

  it("maps a quoted post", () => {
    expect(
      toEmbedView({
        $type: "app.bsky.embed.record#view",
        record: {
          $type: "app.bsky.embed.record#viewRecord",
          uri: "at://q",
          author: { handle: "q.test" },
          value: { text: "quoted" },
        },
      }),
    ).toEqual({
      kind: "quote",
      uri: "at://q",
      handle: "q.test",
      displayName: undefined,
      text: "quoted",
    });
  });

  it("marks records that cannot be shown as unsupported", () => {
    expect(
      toEmbedView({
        $type: "app.bsky.embed.recordWithMedia#view",
        record: { record: { $type: "unknown" } },
      }),
    ).toEqual({ kind: "unsupported" });
    expect(toEmbedView({ $type: "app.bsky.embed.record#view" })).toEqual({
      kind: "unsupported",
    });
  });
});
