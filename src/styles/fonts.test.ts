import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const FILES = [
  "public/fonts/shadows-into-light-latin.woff2",
  "public/fonts/shadows-into-light-latin-ext.woff2",
  "public/fonts/OFL.txt",
  "public/fonts/zen-kurenaido/OFL.txt",
];

describe("fonts", () => {
  it.each(FILES)("%s exists", (file) => {
    expect(existsSync(file)).toBe(true);
  });

  it("css never points at google hosts", () => {
    for (const file of ["src/styles/fonts.css", "src/styles/zen-kurenaido.css"]) {
      const css = readFileSync(file, "utf8");
      expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    }
    expect(readFileSync("src/styles/fonts.css", "utf8")).toContain("Shadows Into Light");
    expect(readFileSync("src/styles/zen-kurenaido.css", "utf8")).toContain("Zen Kurenaido");
  });
});
