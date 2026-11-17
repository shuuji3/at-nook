// not reviewed
import '@testing-library/jest-dom/vitest'
import { QueryClient } from '@tanstack/vue-query'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// Node 26 defines a global `localStorage` getter that stays undefined without
// --localstorage-file, so vitest's jsdom environment leaves it missing too.
// Install a plain in-memory Storage for the tests that persist a session.
if (!globalThis.localStorage) {
  const entries = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => void entries.delete(key),
    setItem: (key, value) => void entries.set(key, String(value)),
  }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  Object.defineProperty(globalThis.window, 'localStorage', { value: storage, configurable: true })
}

afterEach(cleanup)
afterEach(() => {
  localStorage.clear()
  document.title = ''
})

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}
