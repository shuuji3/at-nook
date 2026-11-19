import {
  CompositeDidDocumentResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  XrpcHandleResolver,
} from '@atcute/identity-resolver'
import type { ActorIdentifier, Did } from '@atcute/lexicons'
import { isLoopbackHost } from '@atcute/oauth-types'
import {
  configureOAuth,
  createAuthorizationUrl,
  deleteStoredSession,
  finalizeAuthorization,
  getSession,
  OAuthUserAgent,
} from '@atcute/oauth-browser-client'
import { PUBLIC_APPVIEW_URL } from '~/utils/endpoints'
import { OAUTH_SCOPE } from '~/utils/oauth-scope'
import { setHandler } from '~/utils/rpc'

const DID_STORAGE_KEY = 'at-nook:did'

export interface OAuthEndpoints {
  client_id: string
  redirect_uri: string
}

/**
 * Picks the oauth client for the origin the app is served from.
 *
 * loopback origins use the development `http://localhost` client id, which the
 * atproto spec only allows with a loopback redirect; every other origin must
 * serve its own client metadata document over https.
 */
export function oauthEndpoints(origin: string): OAuthEndpoints {
  const url = new URL(origin)

  if (isLoopbackHost(url.hostname)) {
    const redirect_uri = `http://127.0.0.1:${url.port}/oauth/callback`
    return {
      client_id: `http://localhost?redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(OAUTH_SCOPE)}`,
      redirect_uri,
    }
  }

  return {
    client_id: `${origin}/oauth-client-metadata.json`,
    redirect_uri: `${origin}/oauth/callback`,
  }
}

let configured = false

function ensureOAuth() {
  if (configured) {
    return
  }

  const identityResolver = new LocalActorResolver({
    handleResolver: new XrpcHandleResolver({
      serviceUrl: PUBLIC_APPVIEW_URL,
    }),
    didDocumentResolver: new CompositeDidDocumentResolver({
      methods: {
        plc: new PlcDidDocumentResolver(),
        web: new WebDidDocumentResolver(),
      },
    }),
  })

  configureOAuth({
    metadata: oauthEndpoints(window.location.origin),
    identityResolver,
  })

  configured = true
}

/** Reads the did of the signed-in account from local storage. */
export function getStoredDid(): string | null {
  try {
    return localStorage.getItem(DID_STORAGE_KEY)
  } catch {
    return null
  }
}

/** Remembers the signed-in account across reloads. */
export function storeDid(did: string): void {
  try {
    localStorage.setItem(DID_STORAGE_KEY, did)
  } catch {
    // a blocked localStorage only costs persistence, not the session
  }
}

/** Forgets the signed-in account. */
export function clearStoredDid(): void {
  try {
    localStorage.removeItem(DID_STORAGE_KEY)
  } catch {
    // nothing to clear if storage is unavailable
  }
}

/** Builds the authorization url for a handle. the caller performs the navigation. */
export async function startLogin(identifier: string): Promise<URL> {
  ensureOAuth()

  return await createAuthorizationUrl({
    target: { type: 'account', identifier: identifier as ActorIdentifier },
    scope: OAUTH_SCOPE,
  })
}

/** Completes the OAuth flow from the callback fragment and stores the resulting did. */
export async function finishLogin(hash: string): Promise<{ did: string }> {
  ensureOAuth()

  const { session } = await finalizeAuthorization(new URLSearchParams(hash.slice(1)))
  const did = session.info.sub

  storeDid(did)
  return { did }
}

/**
 * Resumes a stored session and arms the authenticated reader with it, dropping
 * the session when it is no longer usable.
 */
export async function resumeSession(did: string): Promise<boolean> {
  ensureOAuth()

  try {
    const session = await getSession(did as Did)
    setHandler(new OAuthUserAgent(session))
    return true
  } catch {
    setHandler(null)
    deleteStoredSession(did as Did)
    clearStoredDid()
    return false
  }
}

/** Revokes the session and forgets the account locally, even if revocation fails. */
export async function signOut(did: string): Promise<void> {
  ensureOAuth()

  try {
    const session = await getSession(did as Did, { allowStale: true })
    await new OAuthUserAgent(session).signOut()
  } catch {
    // clearing local state is what matters when the server is unreachable
  }

  setHandler(null)
  deleteStoredSession(did as Did)
  clearStoredDid()
}
