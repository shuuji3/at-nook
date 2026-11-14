import { screen } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  authorFeedQuery: vi.fn(),
}));

vi.mock("../lib/session", () => ({
  useSession: () => ({
    session: { value: { did: "did:plc:me", handle: "me.test" } },
    ready: { value: true },
    end: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock("../lib/queries", () => ({
  profileQuery: mocks.profileQuery,
  authorFeedQuery: mocks.authorFeedQuery,
}));

import { renderWithProviders } from "../test/render";
import Notebook from "./profile/[actor].vue";

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

const routes = [{ path: "/profile/:actor", component: { template: "<div />" } }];

beforeEach(() => {
  vi.clearAllMocks();
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
    await renderWithProviders(Notebook, { route: "/profile/bsky.app", routes });

    expect(await screen.findByRole("heading", { name: /Bluesky/ })).toBeTruthy();
    expect(screen.getByText("@bsky.app")).toBeTruthy();
    expect(document.title).toBe("at-nook — Bluesky (@bsky.app)");
    expect(await screen.findAllByRole("article")).toHaveLength(1);
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

    await renderWithProviders(Notebook, { route: "/profile/plain.test", routes });

    expect(await screen.findByRole("heading")).toBeTruthy();
    expect(document.title).toBe("at-nook — @plain.test");
  });

  it("says when the notebook has no more writing", async () => {
    mocks.authorFeedQuery.mockReturnValue(feedPage([]));

    await renderWithProviders(Notebook, { route: "/profile/bsky.app", routes });

    expect(await screen.findByText("the rest of the notebook is empty")).toBeTruthy();
  });

  it("shows pronouns when the profile has them", async () => {
    mocks.profileQuery.mockImplementation((actor: string) => ({
      queryKey: ["profile", actor],
      queryFn: async () => ({ ...profile, handle: actor, pronouns: "she/her" }),
    }));

    await renderWithProviders(Notebook, { route: "/profile/bsky.app", routes });

    expect(await screen.findByText("she/her")).toBeTruthy();
  });
});
