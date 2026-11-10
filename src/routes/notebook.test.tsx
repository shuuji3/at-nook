import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  authorFeedQuery: vi.fn(),
  getStoredDid: vi.fn(),
}));

vi.mock("../lib/auth", () => ({
  getStoredDid: mocks.getStoredDid,
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("../lib/queries", () => ({
  profileQuery: mocks.profileQuery,
  authorFeedQuery: mocks.authorFeedQuery,
  followsQuery: vi.fn(() => ({
    queryKey: ["follows"],
    queryFn: async () => ({ follows: [] }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  })),
  listsQuery: vi.fn(() => ({
    queryKey: ["lists"],
    queryFn: async () => ({ lists: [] }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  })),
}));

import { App } from "../app";
import { renderWithProviders } from "../test/render";

const post = (uri: string) => ({
  uri,
  cid: "cid",
  author: { did: "did:plc:a", handle: "bsky.app" },
  record: { text: "hello", createdAt: "2026-11-08T12:33:58.545Z" },
  indexedAt: "2026-11-08T12:33:58.545Z",
});

const profile = {
  did: "did:plc:a",
  handle: "bsky.app",
  displayName: "Bluesky",
  banner: undefined,
  avatar: undefined,
};

const feedPage = (feed: unknown[], cursor?: string) => ({
  queryKey: ["authorFeed"],
  queryFn: async () => ({ feed, cursor }),
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getStoredDid.mockReturnValue(null);
  mocks.profileQuery.mockImplementation((actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => ({ ...profile, handle: actor }),
  }));
  mocks.authorFeedQuery.mockReturnValue(
    feedPage([
      { post: post("at://did:plc:a/app.bsky.feed.post/1") },
      {
        post: post("at://did:plc:a/app.bsky.feed.post/2"),
        reason: { $type: "app.bsky.feed.defs#reasonRepost" },
      },
    ]),
  );
});

describe("notebook", () => {
  it("titles the page with the display name and handle", async () => {
    renderWithProviders(<App />, { route: "/profile/bsky.app" });

    expect(await screen.findByRole("heading", { name: /Bluesky/ })).toBeTruthy();
    expect(screen.getByText("@bsky.app")).toBeTruthy();
    expect(document.title).toBe("notebook — Bluesky (@bsky.app)");
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("keeps the handle when there is no display name", async () => {
    mocks.profileQuery.mockImplementation((actor: string) => ({
      queryKey: ["profile", actor],
      queryFn: async () => ({
        did: "did:plc:a",
        handle: "plain.test",
        displayName: undefined,
      }),
    }));

    renderWithProviders(<App />, { route: "/profile/plain.test" });

    expect(await screen.findByRole("heading")).toBeTruthy();
    expect(document.title).toBe("notebook — @plain.test");
  });

  it("says when the notebook has no more writing", async () => {
    mocks.authorFeedQuery.mockReturnValue(feedPage([]));

    renderWithProviders(<App />, { route: "/profile/bsky.app" });

    expect(await screen.findByText("the rest of the notebook is empty")).toBeTruthy();
  });

  it("shows pronouns when the profile has them", async () => {
    mocks.profileQuery.mockImplementation((actor: string) => ({
      queryKey: ["profile", actor],
      queryFn: async () => ({ ...profile, handle: actor, pronouns: "she/her" }),
    }));

    renderWithProviders(<App />, { route: "/profile/bsky.app" });

    expect(await screen.findByText("she/her")).toBeTruthy();
  });
});
