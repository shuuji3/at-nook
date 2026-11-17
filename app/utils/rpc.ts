import { Client, simpleFetchHandler, type FetchHandlerObject } from '@atcute/client'
import type {} from '@atcute/bluesky'
import { APPVIEW_AUDIENCE } from './oauth-scope'

// TODO: support configuring service endpoints; this AppView and APPVIEW_AUDIENCE
// in oauth-scope.ts are currently hardcoded.
/** the public AppView, used only by the cover for handle candidates */
export const publicRpc = new Client({
  handler: simpleFetchHandler({ service: 'https://public.api.bsky.app' }),
})

let reader: Client | null = null

/**
 * Points the reader at the signed-in account's PDS, proxying reads to the
 * AppView. Pass null to drop it on sign out.
 */
export function setReader(handler: FetchHandlerObject | null): void {
  reader = handler ? new Client({ handler, proxy: APPVIEW_AUDIENCE }) : null
}

/** The authenticated reader. Every atproto read goes through it. */
export function rpc(): Client {
  if (!reader) {
    throw new Error('read attempted before sign-in')
  }

  return reader
}
