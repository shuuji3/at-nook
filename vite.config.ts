import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const DEV_HOST = "127.0.0.1";
const DEV_PORT = 12520;
const TUNNEL_HOST = "bluesky-notebook-reader.shuuji3.xyz";

export default defineConfig({
  plugins: [react()],
  server: {
    host: DEV_HOST,
    port: DEV_PORT,
    allowedHosts: [TUNNEL_HOST],
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    env: { TZ: "UTC" },
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
