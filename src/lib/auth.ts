import {
  CompositeDidDocumentResolver,
  LocalActorResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  XrpcHandleResolver,
} from "@atcute/identity-resolver";
import type { ActorIdentifier, Did } from "@atcute/lexicons";
import {
  configureOAuth,
  createAuthorizationUrl,
  deleteStoredSession,
  finalizeAuthorization,
  getSession,
  OAuthUserAgent,
} from "@atcute/oauth-browser-client";

const DID_STORAGE_KEY = "notebook-reader:did";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost"]);

export interface OAuthEndpoints {
  client_id: string;
  redirect_uri: string;
}

/**
 * Picks the oauth client for the origin the app is served from.
 *
 * loopback origins use the development `http://localhost` client id, which the
 * atproto spec only allows with a loopback redirect; every other origin must
 * serve its own client metadata document over https.
 */
export const oauthEndpoints = (origin: string): OAuthEndpoints => {
  const url = new URL(origin);

  if (LOOPBACK_HOSTS.has(url.hostname)) {
    const redirect_uri = `http://127.0.0.1:${url.port}/oauth/callback`;
    return {
      client_id: `http://localhost?redirect_uri=${encodeURIComponent(redirect_uri)}&scope=atproto`,
      redirect_uri,
    };
  }

  return {
    client_id: `${origin}/oauth-client-metadata.json`,
    redirect_uri: `${origin}/oauth/callback`,
  };
};

let configured = false;

const ensureOAuth = () => {
  if (configured) {
    return;
  }
  configured = true;

  const identityResolver = new LocalActorResolver({
    handleResolver: new XrpcHandleResolver({
      serviceUrl: "https://public.api.bsky.app",
    }),
    didDocumentResolver: new CompositeDidDocumentResolver({
      methods: {
        plc: new PlcDidDocumentResolver(),
        web: new WebDidDocumentResolver(),
      },
    }),
  });

  configureOAuth({
    metadata: oauthEndpoints(window.location.origin),
    identityResolver,
  });
};

/** Reads the did of the signed-in account from local storage. */
export const getStoredDid = (): string | null => {
  try {
    return localStorage.getItem(DID_STORAGE_KEY);
  } catch {
    return null;
  }
};

/** Remembers the signed-in account across reloads. */
export const storeDid = (did: string): void => {
  try {
    localStorage.setItem(DID_STORAGE_KEY, did);
  } catch {
    // a blocked localStorage only costs persistence, not the session
  }
};

/** Forgets the signed-in account. */
export const clearStoredDid = (): void => {
  try {
    localStorage.removeItem(DID_STORAGE_KEY);
  } catch {
    // nothing to clear if storage is unavailable
  }
};

/** Builds the authorization url for a handle. the caller performs the navigation. */
export const startLogin = async (identifier: string): Promise<URL> => {
  ensureOAuth();

  return await createAuthorizationUrl({
    target: { type: "account", identifier: identifier as ActorIdentifier },
    scope: "atproto",
  });
};

/** Completes the OAuth flow from the callback fragment and stores the resulting did. */
export const finishLogin = async (hash: string): Promise<{ did: string }> => {
  ensureOAuth();

  const { session } = await finalizeAuthorization(new URLSearchParams(hash.slice(1)));
  const did = session.info.sub;

  storeDid(did);
  return { did };
};

/** Checks that a stored session is still usable, dropping it when it is not. */
export const resumeSession = async (did: string): Promise<boolean> => {
  ensureOAuth();

  try {
    await getSession(did as Did);
    return true;
  } catch {
    deleteStoredSession(did as Did);
    clearStoredDid();
    return false;
  }
};

/** Revokes the session and forgets the account locally, even if revocation fails. */
export const signOut = async (did: string): Promise<void> => {
  ensureOAuth();

  try {
    const session = await getSession(did as Did, { allowStale: true });
    await new OAuthUserAgent(session).signOut();
  } catch {
    // clearing local state is what matters when the server is unreachable
  }

  deleteStoredSession(did as Did);
  clearStoredDid();
};
