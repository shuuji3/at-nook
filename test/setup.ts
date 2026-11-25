// not reviewed
import '@testing-library/jest-dom/vitest'
import { QueryClient } from '@tanstack/vue-query'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

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
