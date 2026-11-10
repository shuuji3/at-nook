import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
}));

vi.mock("../lib/session", () => ({ useSession: mocks.useSession }));
vi.mock("../lib/queries", () => ({
  followsQuery: mocks.followsQuery,
  listsQuery: mocks.listsQuery,
}));

import { renderWithProviders } from "../test/render";
import { ShelfRoute } from "./shelf";

const page = (key: string, value: unknown) => ({
  queryKey: [key],
  queryFn: async () => value,
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useSession.mockReturnValue({
    session: { did: "did:plc:me", handle: "me.test" },
    ready: true,
    end: vi.fn(),
    refresh: vi.fn(),
  });
  mocks.followsQuery.mockReturnValue(
    page("follows", {
      follows: [{ did: "did:plc:a", handle: "alice.test", displayName: "Alice" }],
    }),
  );
  mocks.listsQuery.mockReturnValue(
    page("lists", {
      lists: [
        { uri: "at://did:plc:me/app.bsky.graph.list/for-me", name: "for me", listItemCount: 7 },
      ],
    }),
  );
});

describe("shelf", () => {
  it("shows the following group and every list as groups", async () => {
    renderWithProviders(<ShelfRoute />);

    expect(await screen.findByRole("button", { name: /following/ })).toBeTruthy();
    expect(await screen.findByRole("button", { name: /for me/ })).toBeTruthy();
  });

  it("opens the following group by default", async () => {
    renderWithProviders(<ShelfRoute />);

    expect(await screen.findByText("Alice")).toBeTruthy();
  });

  it("reports an unreachable shelf", async () => {
    mocks.followsQuery.mockReturnValue({
      queryKey: ["follows"],
      queryFn: async () => {
        throw new Error("offline");
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    });

    renderWithProviders(<ShelfRoute />);

    expect(await screen.findByText("the shelf could not be reached")).toBeTruthy();
  });
});
