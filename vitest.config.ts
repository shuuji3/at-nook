import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.{test,spec}.ts"],
          environment: "jsdom",
          setupFiles: ["test/setup.ts"],
          env: { TZ: "UTC" },
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
          globals: true,
          env: { TZ: "UTC" },
          setupFiles: ["test/setup.ts"],
          environmentOptions: { nuxt: { domEnvironment: "jsdom" } },
        },
      }),
    ],
  },
});
