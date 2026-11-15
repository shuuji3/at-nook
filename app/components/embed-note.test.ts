import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test/render";
import EmbedNote from "./embed-note.vue";

describe("embed note", () => {
  it("writes a quote without linking a missing author", async () => {
    await renderWithProviders(EmbedNote, {
      props: {
        embed: { kind: "quote", variant: "quote", uri: "at://q", handle: "", text: "quoted" },
        seed: "at://q",
      },
    });

    expect(screen.getByText("quoted")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links the quoted author when the handle is known", async () => {
    await renderWithProviders(EmbedNote, {
      props: {
        embed: {
          kind: "quote",
          variant: "quote",
          uri: "at://q",
          handle: "q.test",
          displayName: "Q",
          text: "quoted",
        },
        seed: "at://q",
      },
    });

    expect(screen.getByRole("link", { name: "@q.test" })).toHaveAttribute(
      "href",
      "/profile/q.test",
    );
    expect(screen.getByText(/quote from/)).toHaveTextContent(/@q\.test/);
    expect(screen.getByText(/\(Q\)/)).toBeTruthy();
  });
});
