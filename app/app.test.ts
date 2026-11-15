import { screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("./utils/auth", () => ({
  getStoredDid: () => null,
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));

import App from "./app.vue";
import Index from "./pages/index.vue";
import { renderWithProviders } from "./test/render";

describe("app", () => {
  it("renders the cover route", async () => {
    await renderWithProviders(App, {
      route: "/",
      routes: [{ path: "/", component: Index }],
    });

    expect(await screen.findByRole("heading", { name: "at-nook" })).toBeTruthy();
  });
});
