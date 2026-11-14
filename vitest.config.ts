import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    env: { TZ: "UTC" },
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "ref", "dist", ".nuxt"],
  },
});
