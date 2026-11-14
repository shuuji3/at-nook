import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({ startLogin: vi.fn() }));

vi.mock("../lib/auth", () => ({ startLogin: mocks.startLogin }));
vi.mock("../lib/queries", () => ({
  actorCandidatesQuery: (q: string) => ({
    queryKey: ["actorCandidates", q],
    queryFn: async () => ({
      actors: [{ did: "did:plc:z", handle: "bsky.app", displayName: "Bluesky" }],
    }),
  }),
}));

import { renderWithProviders } from "../test/render";
import { CoverRoute } from "./cover";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.startLogin.mockResolvedValue(new URL("https://auth.example/"));
});

describe("cover", () => {
  it("signs in with the typed handle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    await user.type(screen.getByLabelText("handle"), "@bsky.app");
    await user.click(screen.getByRole("button", { name: "open notebook" }));

    expect(mocks.startLogin).toHaveBeenCalledWith("bsky.app");
  });

  it("offers candidates and writes the chosen display name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    await user.type(screen.getByLabelText("handle"), "bsk");

    const candidate = await screen.findByRole("option", { name: /Bluesky/ });
    await user.click(candidate);

    expect(screen.getByText("Bluesky")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "open notebook" }));
    expect(mocks.startLogin).toHaveBeenCalledWith("bsky.app");
  });

  it("moves through candidates with the arrow keys", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    const input = screen.getByLabelText("handle");
    await user.type(input, "bsk");
    await screen.findByRole("option", { name: /Bluesky/ });

    await user.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByText("Bluesky")).toBeTruthy();
    expect((screen.getByLabelText("handle") as HTMLInputElement).value).toBe("bsky.app");

    await user.click(screen.getByRole("button", { name: "open notebook" }));
    expect(mocks.startLogin).toHaveBeenCalledWith("bsky.app");
  });

  it("keeps the button shut with nothing typed", async () => {
    renderWithProviders(<CoverRoute />);

    expect(screen.getByRole("button", { name: "open notebook" })).toBeDisabled();
    expect(mocks.startLogin).not.toHaveBeenCalled();
  });

  it("reports a failed sign-in", () => {
    renderWithProviders(<CoverRoute />, { state: { loginFailed: true } });

    expect(screen.getByText("sign-in did not finish. try again.")).toBeTruthy();
  });
});
