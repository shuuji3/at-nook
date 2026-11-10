import { describe, expect, it } from "vite-plus/test";
import {
  coverHue,
  dayOf,
  documentTitle,
  listHref,
  listUri,
  profileHref,
  rkeyFromUri,
  pickTilts,
  rotationFor,
  splitTimestamp,
  stripAt,
} from "./format";

describe("format", () => {
  it("strips one leading @ and trims", () => {
    expect(stripAt("  @bsky.app ")).toBe("bsky.app");
    expect(stripAt("bsky.app")).toBe("bsky.app");
  });

  it("builds encoded profile and list hrefs", () => {
    expect(profileHref("shuuji3.xyz")).toBe("/profile/shuuji3.xyz");
    expect(listHref("shuuji3.xyz", "for-me")).toBe("/profile/shuuji3.xyz/list/for-me");
  });

  it("builds list uris and reads rkeys", () => {
    expect(listUri("did:plc:abc", "for-me")).toBe("at://did:plc:abc/app.bsky.graph.list/for-me");
    expect(rkeyFromUri("at://did:plc:abc/app.bsky.graph.list/for-me")).toBe("for-me");
  });

  it("splits a timestamp into date and time", () => {
    const result = splitTimestamp("2026-11-08T12:33:58.545Z", "UTC");
    expect(result.date).toBe("2026-11-08 (Sun)");
    expect(result.time).toBe("12:33");
  });

  it("reads the calendar day of a timestamp", () => {
    expect(dayOf("2026-11-08T23:59:00.000Z", "UTC")).toBe("2026-11-08");
  });

  it("keeps rotations in range and deterministic", () => {
    const a = rotationFor("at://post/1", 0);
    expect(a).toBe(rotationFor("at://post/1", 0));
    expect(Math.abs(a)).toBeLessThanOrEqual(2);
    expect(coverHue("did:plc:abc")).toBe(coverHue("did:plc:abc"));
  });

  it("gives every photo in a post its own tilt", () => {
    const tilts = pickTilts("at://post/1", ["a", "b", "c", "d"]);

    expect(new Set(tilts).size).toBe(tilts.length);
    expect(tilts).toEqual(pickTilts("at://post/1", ["a", "b", "c", "d"]));
  });

  it("re-selects when two photos would share a tilt", () => {
    const tilts = pickTilts("at://post/1", ["same", "same", "same"]);

    expect(new Set(tilts).size).toBe(3);
  });

  it("never drops the handle from the title", () => {
    expect(documentTitle({ displayName: "Bluesky", handle: "bsky.app" })).toBe(
      "notebook — Bluesky (@bsky.app)",
    );
    expect(documentTitle({ handle: "bsky.app" })).toBe("notebook — @bsky.app");
  });
});
