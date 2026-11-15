// not reviewed
import { screen } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

const mocks = vi.hoisted(() => ({
  getStoredDid: vi.fn(),
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("~/utils/auth", () => ({
  getStoredDid: mocks.getStoredDid,
  resumeSession: mocks.resumeSession,
  signOut: mocks.signOut,
}));

vi.mock("~/utils/queries", () => ({
  profileQuery: (actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => ({
      did: actor,
      handle: "bsky.app",
      displayName: "Bluesky",
    }),
  }),
}));

import { renderWithProviders } from "../../utils/render";
import { useSession } from "~/composables/use-session";

const Probe = defineComponent({
  setup() {
    const { session, ready } = useSession();
    return () =>
      h("p", `${ready.value ? "ready" : "loading"}|${session.value?.handle ?? "none"}`);
  },
});

const renderSession = () => renderWithProviders(Probe);

beforeEach(() => {
  vi.clearAllMocks();
  clearNuxtState();
});

describe("session", () => {
  it("resumes a stored session and exposes the profile", async () => {
    mocks.getStoredDid.mockReturnValue("did:plc:me");
    mocks.resumeSession.mockResolvedValue(true);

    await renderSession();

    expect(await screen.findByText("ready|bsky.app")).toBeTruthy();
    expect(mocks.resumeSession).toHaveBeenCalledWith("did:plc:me");
  });

  it("reports ready with no session when nothing is stored", async () => {
    mocks.getStoredDid.mockReturnValue(null);

    await renderSession();

    expect(await screen.findByText("ready|none")).toBeTruthy();
    expect(mocks.resumeSession).not.toHaveBeenCalled();
  });

  it("falls back to no session when the stored session is stale", async () => {
    mocks.getStoredDid.mockReturnValue("did:plc:old");
    mocks.resumeSession.mockResolvedValue(false);

    await renderSession();

    expect(await screen.findByText("ready|none")).toBeTruthy();
  });
});
