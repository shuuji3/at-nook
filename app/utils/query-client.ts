import { QueryClient } from '@tanstack/vue-query'

/** The app's query client, with the defaults the notebook was built around. */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: 2, staleTime: 60_000 },
    },
  })
