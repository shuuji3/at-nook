import { afterEach, describe, expect, it } from 'vitest'
import { publicRpc, getClient, rpc, setHandler } from '../../../app/utils/rpc'

afterEach(() => {
  setHandler(null)
})

describe('readClient', () => {
  it('reads from the public host without a session', () => {
    expect(getClient()).toBe(publicRpc)
  })

  it('prefers the signed-in handler once armed', () => {
    setHandler({ handle: async () => new Response('{}') })

    expect(getClient()).toBe(rpc)
  })
})
