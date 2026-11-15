import { screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../utils/render";
import VideoPrint from "~/components/video-print.vue";

describe("video print", () => {
  it("plays in place when tapped", async () => {
    const user = userEvent.setup();
    const { container } = await renderWithProviders(VideoPrint, {
      props: { thumbnail: "t", playlist: "https://video/x.m3u8", alt: "a clip", seed: "at://v" },
    });

    expect(screen.getByAltText("a clip")).toBeTruthy();
    expect(screen.queryByText(/\[video\]/)).toBeNull();
    expect(container.querySelector("video")).toBeNull();

    await user.click(screen.getByRole("button", { name: "a clip" }));

    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video).toHaveAttribute("poster", "t");
  });

  it("keeps a still when the video has no playlist", async () => {
    const { container } = await renderWithProviders(VideoPrint, {
      props: { thumbnail: "t", seed: "at://v" },
    });

    expect(screen.getByAltText("video")).toBeTruthy();
    expect(container.querySelector("video")).toBeNull();
  });
});
