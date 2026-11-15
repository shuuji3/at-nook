import type { Nsid } from "@atcute/lexicons/syntax";

/** the AppView service the reads are proxied to */
export const APPVIEW_AUDIENCE = "did:web:api.bsky.app#bsky_appview";

/** the published permission set for viewing Bluesky public content */
export const VIEW_PERMISSION_SET = "app.bsky.authViewAll";

/**
 * Identity plus the view permission set, per the permissions spec: a client
 * requests a published set with `include:` rather than a hand-rolled list.
 *
 * Written positionally (`include:<nsid>?aud=…`) because that is the form
 * `IncludeScope` parses to and re-serialises, so the requested token matches the
 * token declared in the client metadata.
 */
export const OAUTH_SCOPE = `atproto include:${VIEW_PERMISSION_SET as Nsid}?aud=${APPVIEW_AUDIENCE.replace(
  "#",
  "%23",
)}`;
