// not reviewed
import { vi } from "vitest";

export const configureOAuth = vi.fn();
export const createAuthorizationUrl = vi.fn();
export const finalizeAuthorization = vi.fn();
export const getSession = vi.fn();
export const deleteStoredSession = vi.fn();
export const OAuthUserAgent = vi.fn().mockImplementation(() => ({
  signOut: vi.fn(),
}));
