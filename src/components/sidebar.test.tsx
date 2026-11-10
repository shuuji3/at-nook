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
import { Sidebar } from "./sidebar";

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
      follows: [
        { did: "did:plc:a", handle: "alice.test", displayName: "Alice" },
        { did: "did:plc:b", handle: "bob.test", displayName: "Bob" },
      ],
    }),
  );
  mocks.listsQuery.mockReturnValue(
    page("lists", {
      lists: [
        {
          uri: "at://did:plc:me/app.bsky.graph.list/for-me",
          name: "for me",
          listItemCount: 7,
        },
      ],
    }),
  );
});

describe("sidebar", () => {
  it("lists follows before lists in one flat column with no headings", async () => {
    renderWithProviders(<Sidebar />);

    await screen.findByText("Alice");

    const rows = screen.getAllByRole("link");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Alice"),
      expect.stringContaining("Bob"),
      expect.stringContaining("for me"),
    ]);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("links a list to the owner's list page", async () => {
    renderWithProviders(<Sidebar />);

    expect(await screen.findByRole("link", { name: /for me/ })).toHaveAttribute(
      "href",
      "/profile/me.test/list/for-me",
    );
    expect(screen.getByText("7 people")).toBeTruthy();
  });

  it("marks the open notebook", async () => {
    renderWithProviders(<Sidebar activeActor="alice.test" />);

    expect(await screen.findByRole("link", { name: /Alice/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders nothing when signed out", () => {
    mocks.useSession.mockReturnValue({
      session: null,
      ready: true,
      end: vi.fn(),
      refresh: vi.fn(),
    });

    renderWithProviders(<Sidebar />);

    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
