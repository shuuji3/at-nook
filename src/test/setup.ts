import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

afterEach(cleanup);
afterEach(() => {
  localStorage.clear();
  document.title = "";
});
