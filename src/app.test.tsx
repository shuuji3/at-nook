import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { App } from "./app";
import { renderWithProviders } from "./test/render";

describe("app", () => {
  it("renders the cover route", () => {
    renderWithProviders(<App />);

    expect(screen.getByRole("heading", { name: "at-nook" })).toBeTruthy();
  });
});
