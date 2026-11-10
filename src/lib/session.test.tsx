import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  getStoredDid: vi.fn(),
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("./auth", () => ({
  getStoredDid: mocks.getStoredDid,
  resumeSession: mocks.resumeSession,
  signOut: mocks.signOut,
}));

vi.mock("./queries", () => ({
  profileQuery: (actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => ({
      did: actor,
      handle: "bsky.app",
      displayName: "Bluesky",
    }),
  }),
}));

import { renderWithProviders } from "../test/render";
import { SessionProvider, useSession } from "./session";

const Probe = () => {
  const { session, ready } = useSession();
  return <p>{`${ready ? "ready" : "loading"}|${session?.handle ?? "none"}`}</p>;
};

const renderSession = () =>
  renderWithProviders(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("session", () => {
  it("resumes a stored session and exposes the profile", async () => {
    mocks.getStoredDid.mockReturnValue("did:plc:me");
    mocks.resumeSession.mockResolvedValue(true);

    renderSession();

    expect(await screen.findByText("ready|bsky.app")).toBeTruthy();
    expect(mocks.resumeSession).toHaveBeenCalledWith("did:plc:me");
  });

  it("reports ready with no session when nothing is stored", async () => {
    mocks.getStoredDid.mockReturnValue(null);

    renderSession();

    expect(await screen.findByText("ready|none")).toBeTruthy();
    expect(mocks.resumeSession).not.toHaveBeenCalled();
  });

  it("falls back to no session when the stored session is stale", async () => {
    mocks.getStoredDid.mockReturnValue("did:plc:old");
    mocks.resumeSession.mockResolvedValue(false);

    renderSession();

    expect(await screen.findByText("ready|none")).toBeTruthy();
  });
});
