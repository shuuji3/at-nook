import {
  Client,
  buildFetchHandler,
  simpleFetchHandler,
  type FetchHandler,
  type FetchHandlerObject,
} from '@atcute/client'
import type {} from '@atcute/bluesky'
import { APPVIEW_AUDIENCE } from './oauth-scope'

// TODO: support configuring service endpoints; this AppView and APPVIEW_AUDIENCE
// in oauth-scope.ts are currently hardcoded.
/** the public AppView, used only by the cover for handle candidates */
export const publicRpc = new Client({
  handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
})

let handler: FetchHandler | null = null

/**
 * The authenticated client. Stable for the module's lifetime; the current
 * session's handler is resolved per request. Throws when used before sign-in.
 */
export const rpc = new Client({
  handler: (pathname, init) => {
    if (!handler) {
      throw new Error('read attempted before sign-in')
    }

    return handler(pathname, init)
  },
  proxy: APPVIEW_AUDIENCE,
})

/** Sets the handler behind rpc, or null on sign out. */
export function setHandler(next: FetchHandlerObject | null): void {
  handler = next ? buildFetchHandler(next) : null
}
