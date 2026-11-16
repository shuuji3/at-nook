import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

interface RenderOptions {
  route?: string
  state?: unknown
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', state }: RenderOptions = {},
): RenderResult =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[{ pathname: route, state }]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
