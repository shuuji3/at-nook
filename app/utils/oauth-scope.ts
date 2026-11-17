import type { AtprotoAudience, Nsid } from '@atcute/lexicons/syntax'
import { scope } from '@atcute/oauth-types'

/** the AppView service the reads are proxied to */
export const APPVIEW_AUDIENCE = 'did:web:api.bsky.app#bsky_appview'

/** the published permission set for viewing Bluesky public content */
export const VIEW_PERMISSION_SET = 'app.bsky.authViewAll'

/**
 * Identity plus the view permission set, per the permissions spec: a client
 * requests a published set with `include:` rather than a hand-rolled list.
 */
export const OAUTH_SCOPE = `atproto ${scope.include({
  nsid: VIEW_PERMISSION_SET as Nsid,
  aud: APPVIEW_AUDIENCE as AtprotoAudience,
})}`
