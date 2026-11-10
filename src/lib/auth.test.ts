import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  configureOAuth: vi.fn(),
  createAuthorizationUrl: vi.fn(),
  finalizeAuthorization: vi.fn(),
  getSession: vi.fn(),
  deleteStoredSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@atcute/oauth-browser-client", () => ({
  configureOAuth: mocks.configureOAuth,
  createAuthorizationUrl: mocks.createAuthorizationUrl,
  finalizeAuthorization: mocks.finalizeAuthorization,
  getSession: mocks.getSession,
  deleteStoredSession: mocks.deleteStoredSession,
  OAuthUserAgent: class {
    signOut = mocks.signOut;
  },
}));

import {
  clearStoredDid,
  finishLogin,
  getStoredDid,
  oauthEndpoints,
  resumeSession,
  signOut,
  startLogin,
  storeDid,
} from "./auth";

beforeEach(() => {
  clearStoredDid();
  vi.clearAllMocks();
});

describe("auth", () => {
  it("creates an atproto-only authorization url for the handle", async () => {
    const url = new URL("https://auth.example/");
    mocks.createAuthorizationUrl.mockResolvedValue(url);

    const result = await startLogin("bsky.app");

    expect(result).toBe(url);
    expect(mocks.createAuthorizationUrl).toHaveBeenCalledWith({
      target: { type: "account", identifier: "bsky.app" },
      scope: "atproto",
    });
  });

  it("finalizes authorization and stores the session did", async () => {
    mocks.finalizeAuthorization.mockResolvedValue({
      session: { info: { sub: "did:plc:x" } },
      state: null,
    });

    const result = await finishLogin("#code=abc&state=xyz");

    const params = mocks.finalizeAuthorization.mock.calls[0]![0] as URLSearchParams;
    expect(params.get("code")).toBe("abc");
    expect(result.did).toBe("did:plc:x");
    expect(getStoredDid()).toBe("did:plc:x");
  });

  it("clears the stored did when the session cannot resume", async () => {
    storeDid("did:plc:y");
    mocks.getSession.mockRejectedValue(new Error("expired"));

    expect(await resumeSession("did:plc:y")).toBe(false);
    expect(mocks.deleteStoredSession).toHaveBeenCalledWith("did:plc:y");
    expect(getStoredDid()).toBeNull();
  });

  it("signs out and clears local state", async () => {
    storeDid("did:plc:z");
    mocks.getSession.mockResolvedValue({});

    await signOut("did:plc:z");

    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.deleteStoredSession).toHaveBeenCalledWith("did:plc:z");
    expect(getStoredDid()).toBeNull();
  });
});

describe("oauth endpoints", () => {
  it("uses the loopback client id for a local dev origin", () => {
    expect(oauthEndpoints("http://127.0.0.1:12520")).toEqual({
      client_id:
        "http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A12520%2Foauth%2Fcallback&scope=atproto",
      redirect_uri: "http://127.0.0.1:12520/oauth/callback",
    });
    expect(oauthEndpoints("http://localhost:12520").redirect_uri).toBe(
      "http://127.0.0.1:12520/oauth/callback",
    );
  });

  it("uses the public client metadata for any other origin", () => {
    expect(oauthEndpoints("https://bluesky-notebook-reader.shuuji3.xyz")).toEqual({
      client_id: "https://bluesky-notebook-reader.shuuji3.xyz/oauth-client-metadata.json",
      redirect_uri: "https://bluesky-notebook-reader.shuuji3.xyz/oauth/callback",
    });
  });

  it("keeps the published client metadata in sync with its own origin", () => {
    const metadata = JSON.parse(readFileSync("public/oauth-client-metadata.json", "utf8")) as {
      client_id: string;
      redirect_uris: string[];
    };
    const endpoints = oauthEndpoints("https://bluesky-notebook-reader.shuuji3.xyz");

    expect(metadata.client_id).toBe(endpoints.client_id);
    expect(metadata.redirect_uris).toEqual([endpoints.redirect_uri]);
  });
});
