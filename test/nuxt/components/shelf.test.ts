import { screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  followsQuery: vi.fn(),
  listsQuery: vi.fn(),
  get: vi.fn(),
}));

vi.mock("~/composables/use-session", () => ({
  useSession: () => ({
    session: { value: { did: "did:plc:me", handle: "me.test" } },
    ready: { value: true },
    end: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock("~/utils/queries", () => ({
  followsQuery: mocks.followsQuery,
  listsQuery: mocks.listsQuery,
}));
vi.mock("~/utils/rpc", () => ({ rpc: () => ({ get: mocks.get }) }));

import { renderWithProviders } from "../../utils/render";
import Shelf from "~/components/shelf.vue";

const page = (key: string, value: unknown) => ({
  queryKey: [key],
  queryFn: async () => value,
  initialPageParam: undefined,
  getNextPageParam: () => undefined,
});

beforeEach(() => {
  vi.clearAllMocks();
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
  mocks.get.mockResolvedValue({
    ok: true,
    data: {
      list: { name: "for me", listItemCount: 1 },
      items: [{ subject: { did: "did:plc:b", handle: "bob.test", displayName: "Bob" } }],
    },
  });
});

describe("shelf", () => {
  it("shows the following group and every list as groups", async () => {
    await renderWithProviders(Shelf);

    expect(await screen.findByRole("button", { name: /following/ })).toBeTruthy();
    expect(await screen.findByRole("button", { name: /for me/ })).toBeTruthy();
  });

  it("opens the following group by default", async () => {
    await renderWithProviders(Shelf);

    expect(await screen.findByText("Alice")).toBeTruthy();
  });

  it("swaps the people when another group is chosen", async () => {
    const user = userEvent.setup();
    await renderWithProviders(Shelf);

    await user.click(await screen.findByRole("button", { name: /for me/ }));

    expect(await screen.findByText("Bob")).toBeTruthy();
    expect(screen.queryByText("Alice")).toBeNull();
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

    await renderWithProviders(Shelf);

    expect(await screen.findByText("the shelf could not be reached")).toBeTruthy();
  });
});
