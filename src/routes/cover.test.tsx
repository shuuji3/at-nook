import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  profileQuery: vi.fn(),
  startLogin: vi.fn(),
}));

vi.mock("../lib/queries", () => ({ profileQuery: mocks.profileQuery }));
vi.mock("../lib/auth", () => ({ startLogin: mocks.startLogin }));

import { renderWithProviders } from "../test/render";
import { CoverRoute } from "./cover";

const profileQueryFor =
  (result: { displayName?: string; handle: string; did: string } | Error) => (actor: string) => ({
    queryKey: ["profile", actor],
    queryFn: async () => {
      if (result instanceof Error) {
        throw result;
      }
      return result;
    },
  });

const settle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.startLogin.mockResolvedValue(new URL("https://auth.example/"));
  mocks.profileQuery.mockImplementation(
    profileQueryFor({
      did: "did:plc:x",
      handle: "bsky.app",
      displayName: "Bluesky",
    }),
  );
});

describe("cover", () => {
  it("resolves a handle and opens the notebook", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    await user.type(screen.getByLabelText("handle"), "@bsky.app");

    expect(await screen.findByText("Bluesky")).toBeTruthy();
    const button = screen.getByRole("button", { name: "open notebook" });
    expect(button).toBeEnabled();

    await user.click(button);
    expect(mocks.startLogin).toHaveBeenCalledWith("bsky.app");
  });

  it("shows a correction when the handle does not resolve", async () => {
    mocks.profileQuery.mockImplementation(profileQueryFor(new Error("Profile not found")));
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    await user.type(screen.getByLabelText("handle"), "missing.test");

    expect(await screen.findByText("this handle could not be found")).toBeTruthy();
    expect(screen.getByRole("button", { name: "open notebook" })).toBeDisabled();
  });

  it("never queries junk input", async () => {
    const queryFn = vi.fn(async () => {
      throw new Error("junk input must not be fetched");
    });
    mocks.profileQuery.mockReturnValue({
      queryKey: ["profile", "junk"],
      queryFn,
    });
    const user = userEvent.setup();
    renderWithProviders(<CoverRoute />);

    await user.type(screen.getByLabelText("handle"), "@@@");
    await settle(500);

    expect(queryFn).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "open notebook" })).toBeDisabled();
  });

  it("reports a failed sign-in", () => {
    renderWithProviders(<CoverRoute />, { state: { loginFailed: true } });

    expect(screen.getByText("sign-in did not finish. try again.")).toBeTruthy();
  });
});
