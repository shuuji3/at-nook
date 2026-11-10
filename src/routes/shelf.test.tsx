import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  followsQuery: vi.fn(),
}));

vi.mock("../lib/session", () => ({ useSession: mocks.useSession }));
vi.mock("../lib/queries", () => ({ followsQuery: mocks.followsQuery }));

import { renderWithProviders } from "../test/render";
import { ShelfRoute } from "./shelf";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useSession.mockReturnValue({
    session: { did: "did:plc:me", handle: "me.test" },
    ready: true,
    end: vi.fn(),
    refresh: vi.fn(),
  });
  mocks.followsQuery.mockImplementation((did: string) => ({
    queryKey: ["follows", did],
    queryFn: async () => ({
      follows: [
        {
          did: "did:plc:a",
          handle: "alice.test",
          displayName: "Alice",
          avatar: undefined,
        },
      ],
      cursor: undefined,
    }),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  }));
});

describe("shelf", () => {
  it("shows your own notebook first, then the people you follow", async () => {
    renderWithProviders(<ShelfRoute />);

    expect(screen.getByRole("link", { name: /your notebook/ })).toHaveAttribute(
      "href",
      "/profile/me.test",
    );
    expect(await screen.findByText("Alice")).toBeTruthy();
    expect(screen.getByText("@alice.test")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Alice/ })).toHaveAttribute(
      "href",
      "/profile/alice.test",
    );
  });

  it("reports an unreachable shelf", async () => {
    mocks.followsQuery.mockImplementation((did: string) => ({
      queryKey: ["follows", did],
      queryFn: async () => {
        throw new Error("offline");
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    }));

    renderWithProviders(<ShelfRoute />);

    expect(await screen.findByText("the shelf could not be reached")).toBeTruthy();
  });
});
