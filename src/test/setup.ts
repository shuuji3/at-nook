import "@testing-library/jest-dom/vitest";
import { QueryClient } from "@tanstack/vue-query";
import { cleanup } from "@testing-library/vue";
import { afterEach } from "vitest";

// Node 26 defines a global `localStorage` that is undefined without
// --localstorage-file, and vitest 2's jsdom environment then skips installing
// the jsdom one. Restore it from the jsdom window for the test globals.
const jsdomWindow = (globalThis as { jsdom?: { window: Window } }).jsdom?.window;
if (jsdomWindow?.localStorage) {
  Object.defineProperty(globalThis, "localStorage", {
    value: jsdomWindow.localStorage,
    configurable: true,
  });
}

afterEach(cleanup);
afterEach(() => {
  localStorage.clear();
  document.title = "";
});

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
