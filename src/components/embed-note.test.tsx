import { screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { renderWithProviders } from "../test/render";
import { EmbedNote } from "./embed-note";

describe("embed note", () => {
  it("writes a quote without linking a missing author", () => {
    renderWithProviders(
      <EmbedNote
        embed={{ kind: "quote", uri: "at://q", handle: "", text: "quoted" }}
        seed="at://q"
      />,
    );

    expect(screen.getByText("quoted")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links the quoted author when the handle is known", () => {
    renderWithProviders(
      <EmbedNote
        embed={{
          kind: "quote",
          uri: "at://q",
          handle: "q.test",
          text: "quoted",
        }}
        seed="at://q"
      />,
    );

    expect(screen.getByRole("link", { name: "@q.test" })).toHaveAttribute(
      "href",
      "/profile/q.test",
    );
  });
});
