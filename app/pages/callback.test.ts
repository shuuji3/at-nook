// not reviewed
import { screen, waitFor } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";

const mocks = vi.hoisted(() => ({ finishLogin: vi.fn(), refresh: vi.fn() }));

vi.mock("../utils/auth", () => ({ finishLogin: mocks.finishLogin, getStoredDid: () => null }));
vi.mock("../composables/use-session", () => ({ useSession: () => ({ refresh: mocks.refresh }) }));

import { RouterView } from "vue-router";
import { renderWithProviders } from "../test/render";
import Callback from "./oauth/callback.vue";

const Cover = { setup: () => () => h("h1", "at-nook") };
const Root = { setup: () => () => h(RouterView) };

const routes = [
  { path: "/oauth/callback", component: Callback },
  { path: "/", component: Cover },
];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  window.location.hash = "";
});

describe("oauth callback", () => {
  it("stores the session, scrubs the fragment, and shows the cover", async () => {
    window.location.hash = "#code=abc&state=xyz";
    mocks.finishLogin.mockResolvedValue({ did: "did:plc:me" });

    const { router } = await renderWithProviders(Root, {
      route: "/oauth/callback",
      routes,
    });

    await waitFor(() => expect(mocks.finishLogin).toHaveBeenCalledTimes(1));
    expect(mocks.finishLogin).toHaveBeenCalledWith("#code=abc&state=xyz");
    expect(window.location.hash).toBe("");
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/"));
    expect(await screen.findByRole("heading", { name: "at-nook" })).toBeTruthy();
  });

  it("returns to the cover with a note when the callback fails", async () => {
    window.location.hash = "#code=abc&state=stale";
    mocks.finishLogin.mockRejectedValue(new Error("stale state"));

    const { router } = await renderWithProviders(Root, {
      route: "/oauth/callback",
      routes,
    });

    await waitFor(() => expect(router.currentRoute.value.path).toBe("/"));
    expect(router.currentRoute.value.query.loginFailed).toBe("1");
    expect(window.location.hash).toBe("");
  });
});
