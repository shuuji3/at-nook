/**
 * Serves the atproto OAuth client metadata for whatever origin the request
 * arrives on, so client_id and redirect_uris always match the deploy (and its
 * preview hostnames) without committing any domain.
 */
export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin

  return {
    client_id: `${origin}/oauth-client-metadata.json`,
    client_name: 'at-nook',
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: 'atproto include?nsid=app.bsky.authViewAll&aud=did:web:api.bsky.app%23bsky_appview',
    redirect_uris: [`${origin}/oauth/callback`],
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  }
})
