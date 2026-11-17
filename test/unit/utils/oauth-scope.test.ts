import { isOAuthScope } from '@atcute/oauth-types'
import { describe, expect, it } from 'vitest'
import { APPVIEW_AUDIENCE } from '../../../app/utils/endpoints'
import { OAUTH_SCOPE, VIEW_PERMISSION_SET } from '../../../app/utils/oauth-scope'

describe('oauth scope', () => {
  it('requests identity plus the published view permission set', () => {
    expect(OAUTH_SCOPE.startsWith('atproto ')).toBe(true)
    expect(OAUTH_SCOPE).toContain('include')
    expect(OAUTH_SCOPE).toContain(VIEW_PERMISSION_SET)
    expect(OAUTH_SCOPE).toContain('aud=did:web:api.bsky.app%23bsky_appview')
    expect(APPVIEW_AUDIENCE).toBe('did:web:api.bsky.app#bsky_appview')
  })

  it('is a valid scope string per the library', () => {
    expect(isOAuthScope(OAUTH_SCOPE)).toBe(true)
  })

  it('never asks for broad access', () => {
    expect(OAUTH_SCOPE).not.toContain('transition:')
    expect(OAUTH_SCOPE).not.toContain('*')
    expect(OAUTH_SCOPE).not.toContain('repo:')
    expect(OAUTH_SCOPE).not.toContain('blob')
    expect(OAUTH_SCOPE).not.toContain('account')
    expect(OAUTH_SCOPE).not.toContain('identity')
  })
})
