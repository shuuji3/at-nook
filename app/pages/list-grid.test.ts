// not reviewed
import { screen } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  listQuery: vi.fn(),
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
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
  listQuery: mocks.listQuery,
  followsQuery: mocks.followsQuery,
  listsQuery: mocks.listsQuery,
}));

import { renderWithProviders } from "../test/render";
import ListGrid from "./profile/[actor]/list/[rkey].vue";

const alice = {
  did: "did:plc:a",
  handle: "alice.test",
  displayName: "Alice",
};
const bob = { did: "did:plc:b", handle: "bob.test", displayName: "Bob" };

const listPage = (items: unknown[]) => ({
  queryKey: ["list"],
  queryFn: async () => ({
    list: { name: "for me", listItemCount: items.length },
    items: items.map((subject) => ({ subject })),
    cursor: undefined,
  }),
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
});

const routes = [{ path: "/profile/:actor/list/:rkey", component: { template: "<div />" } }];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.profileQuery.mockImplementation((actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => ({ did: "did:plc:me", handle: actor }),
  }));
  mocks.listQuery.mockReturnValue(listPage([alice, bob]));
  mocks.followsQuery.mockReturnValue(listPage([]));
  mocks.listsQuery.mockReturnValue(listPage([]));
});

describe("list grid", () => {
  it("shows the list name and its members", async () => {
    await renderWithProviders(ListGrid, {
      route: "/profile/me.test/list/for-me",
      routes,
    });

    expect(await screen.findByRole("heading", { name: /for me/ })).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Alice/ })).toHaveAttribute(
      "href",
      "/profile/alice.test",
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("says when a list has no members", async () => {
    mocks.listQuery.mockReturnValue(listPage([]));

    await renderWithProviders(ListGrid, {
      route: "/profile/me.test/list/empty",
      routes,
    });

    expect(await screen.findByText("this list is empty")).toBeTruthy();
  });

  it("shows a torn page when the list cannot be read", async () => {
    mocks.listQuery.mockReturnValue({
      queryKey: ["list"],
      queryFn: async () => {
        throw new Error("List not found");
      },
      initialPageParam: undefined,
      getNextPageParam: () => undefined,
    });

    await renderWithProviders(ListGrid, {
      route: "/profile/me.test/list/missing",
      routes,
    });

    expect(await screen.findByText("this page is torn out")).toBeTruthy();
  });
});
