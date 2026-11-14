import { screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

vi.mock("./lib/auth", () => ({
  getStoredDid: () => null,
  resumeSession: vi.fn(),
  signOut: vi.fn(),
}));

import App from "./app.vue";
import Index from "./routes/index.vue";
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
