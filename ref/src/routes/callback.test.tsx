import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  finishLogin: vi.fn(),
  profileQuery: vi.fn(),
  getStoredDid: vi.fn(),
}));

vi.mock("../lib/auth", () => ({
  finishLogin: mocks.finishLogin,
  getStoredDid: mocks.getStoredDid,
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../lib/queries", () => ({
  profileQuery: mocks.profileQuery,
  actorCandidatesQuery: (q: string) => ({
    queryKey: ["actorCandidates", q],
    queryFn: async () => ({ actors: [] }),
  }),
}));

import { App } from "../app";
import { renderWithProviders } from "../test/render";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getStoredDid.mockReturnValue(null);
  mocks.profileQuery.mockImplementation((actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => ({ did: actor, handle: actor }),
  }));
});

afterEach(() => {
  window.location.hash = "";
});

describe("oauth callback", () => {
  it("stores the session, scrubs the fragment, and shows the cover", async () => {
    window.location.hash = "#code=abc&state=xyz";
    mocks.finishLogin.mockResolvedValue({ did: "did:plc:me" });

    renderWithProviders(<App />, { route: "/oauth/callback" });

    await waitFor(() => expect(mocks.finishLogin).toHaveBeenCalledTimes(1));
    expect(mocks.finishLogin).toHaveBeenCalledWith("#code=abc&state=xyz");
    expect(window.location.hash).toBe("");
    expect(await screen.findByRole("heading", { name: "at-nook" })).toBeTruthy();
  });

  it("returns to the cover with a note when the callback fails", async () => {
    window.location.hash = "#code=abc&state=stale";
    mocks.finishLogin.mockRejectedValue(new Error("stale state"));

    renderWithProviders(<App />, { route: "/oauth/callback" });

    expect(await screen.findByText("sign-in did not finish. try again.")).toBeTruthy();
    expect(window.location.hash).toBe("");
  });
});
