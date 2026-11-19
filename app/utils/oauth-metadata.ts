import { OAUTH_SCOPE } from './oauth-scope'

/** atproto client metadata for a deploy, keyed to the origin it is served from. */
export function oauthClientMetadata(host: string) {
  return {
    client_id: `https://${host}/oauth-client-metadata.json`,
    client_name: 'at-nook',
    application_type: 'web',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: OAUTH_SCOPE,
    redirect_uris: [`https://${host}/oauth/callback`],
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  }
}
