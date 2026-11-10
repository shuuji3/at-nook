export interface EmbedImage {
  fullsize: string;
  thumb: string;
  alt: string;
  width?: number;
  height?: number;
}

export type EmbedView =
  | { kind: "images"; images: EmbedImage[] }
  | { kind: "video"; thumbnail?: string }
  | {
      kind: "external";
      uri: string;
      title: string;
      description: string;
      thumb?: string;
    }
  | {
      kind: "quote";
      uri: string;
      handle: string;
      displayName?: string;
      text: string;
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

    case "app.bsky.embed.video#view":
      return { kind: "video", thumbnail: readString(embed.thumbnail) };

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
        uri: readString(record.uri) ?? "",
        handle: readString(author.handle) ?? "",
        displayName: readString(author.displayName),
        text: readString(value.text) ?? "",
      };
    }

    default:
      return { kind: "unsupported" };
  }
};
