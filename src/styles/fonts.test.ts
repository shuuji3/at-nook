import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const FILES = [
  "public/fonts/shadows-into-light-latin.woff2",
  "public/fonts/shadows-into-light-latin-ext.woff2",
  "public/fonts/OFL.txt",
];

describe("fonts", () => {
  it.each(FILES)("%s exists", (file) => {
    expect(existsSync(file)).toBe(true);
  });

  it("css never points at google hosts", () => {
    const css = readFileSync("src/styles/fonts.css", "utf8");
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    expect(css).toContain("Shadows Into Light");
  });
});
