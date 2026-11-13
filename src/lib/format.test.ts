import { describe, expect, it } from "vite-plus/test";
import {
  coverHue,
  dayOf,
  documentTitle,
  listHref,
  listUri,
  profileHref,
  rkeyFromUri,
  pickSpread,
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

  it("keeps every photo in a post clearly apart", () => {
    const keys = ["a", "b", "c", "d"];
    const tilts = pickSpread("at://post/1", keys, { min: -2, max: 2, step: 0.1, gap: 0.6 });
    const nudges = pickSpread("at://post/1", keys, { min: -8, max: 8, step: 0.1, gap: 3 });

    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        expect(Math.abs((tilts[i] ?? 0) - (tilts[j] ?? 0))).toBeGreaterThanOrEqual(0.6);
        expect(Math.abs((nudges[i] ?? 0) - (nudges[j] ?? 0))).toBeGreaterThanOrEqual(3);
      }
    }
    expect(tilts).toEqual(
      pickSpread("at://post/1", keys, { min: -2, max: 2, step: 0.1, gap: 0.6 }),
    );
  });

  it("spreads identical keys apart", () => {
    const keys = ["same", "same", "same"];
    const tilts = pickSpread("at://post/1", keys, { min: -2, max: 2, step: 0.1, gap: 0.6 });

    expect(new Set(tilts).size).toBe(3);
  });

  it("never drops the handle from the title", () => {
    expect(documentTitle({ displayName: "Bluesky", handle: "bsky.app" })).toBe(
      "at-nook — Bluesky (@bsky.app)",
    );
    expect(documentTitle({ handle: "bsky.app" })).toBe("at-nook — @bsky.app");
  });
});
