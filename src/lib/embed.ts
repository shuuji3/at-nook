export interface EmbedImage {
  fullsize: string;
  thumb: string;
  alt: string;
  width?: number;
  height?: number;
}

export type EmbedView =
  | { kind: "images"; images: EmbedImage[] }
  | {
      kind: "video";
      thumbnail?: string;
      playlist?: string;
      alt?: string;
      width?: number;
      height?: number;
    }
  | {
      kind: "external";
      uri: string;
      title: string;
      description: string;
      thumb?: string;
    }
  | {
      kind: "quote";
      variant: "reply" | "quote";
      uri: string;
      handle: string;
      displayName?: string;
      createdAt?: string;
      text: string;
      facets?: unknown;
    }
  | { kind: "unsupported" }
  | null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const readNumber = (value: unknown): number | undefined =>
  typeof value === "number" ? value : undefined;

const readImage = (value: unknown): EmbedImage => {
  const image = isRecord(value) ? value : {};
  const aspectRatio = isRecord(image.aspectRatio) ? image.aspectRatio : {};

  return {
    fullsize: readString(image.fullsize) ?? "",
    thumb: readString(image.thumb) ?? "",
    alt: readString(image.alt) ?? "",
    width: readNumber(aspectRatio.width),
    height: readNumber(aspectRatio.height),
  };
};

/** Turns a post's raw embed into the small shape the notebook knows how to draw. */
export const toEmbedView = (embed: unknown): EmbedView => {
  if (!isRecord(embed)) {
    return null;
  }

  switch (embed.$type) {
    case "app.bsky.embed.images#view": {
      const images = Array.isArray(embed.images) ? embed.images : [];
      return { kind: "images", images: images.map(readImage) };
    }

    case "app.bsky.embed.video#view": {
      const aspectRatio = isRecord(embed.aspectRatio) ? embed.aspectRatio : {};
      return {
        kind: "video",
        thumbnail: readString(embed.thumbnail),
        playlist: readString(embed.playlist),
        alt: readString(embed.alt),
        width: readNumber(aspectRatio.width),
        height: readNumber(aspectRatio.height),
      };
    }

    case "app.bsky.embed.external#view": {
      const external = isRecord(embed.external) ? embed.external : {};
      return {
        kind: "external",
        uri: readString(external.uri) ?? "",
        title: readString(external.title) ?? "",
        description: readString(external.description) ?? "",
        thumb: readString(external.thumb),
      };
    }

    case "app.bsky.embed.record#view": {
      const record = isRecord(embed.record) ? embed.record : null;
      if (record?.$type !== "app.bsky.embed.record#viewRecord") {
        return { kind: "unsupported" };
      }

      const author = isRecord(record.author) ? record.author : {};
      const value = isRecord(record.value) ? record.value : {};

      return {
        kind: "quote",
        variant: "quote",
        uri: readString(record.uri) ?? "",
        handle: readString(author.handle) ?? "",
        displayName: readString(author.displayName),
        createdAt: readString(value.createdAt),
        text: readString(value.text) ?? "",
        facets: value.facets,
      };
    }

    default:
      return { kind: "unsupported" };
  }
};

/** Reads the post a feed item replies to, so it can be clipped into the entry. */
export const toReplyView = (reply: unknown): EmbedView => {
  if (!isRecord(reply)) {
    return null;
  }

  const parent = reply.parent;
  if (!isRecord(parent) || parent.$type !== "app.bsky.feed.defs#postView") {
    return null;
  }

  const author = isRecord(parent.author) ? parent.author : {};
  const value = isRecord(parent.record) ? parent.record : {};

  return {
    kind: "quote",
    variant: "reply",
    uri: readString(parent.uri) ?? "",
    handle: readString(author.handle) ?? "",
    displayName: readString(author.displayName),
    createdAt: readString(value.createdAt),
    text: readString(value.text) ?? "",
    facets: value.facets,
  };
};
