import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getStoredDid, resumeSession, signOut } from './auth'
import { profileQuery } from './queries'

export interface Session {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

interface SessionContextValue {
  session: Session | null
  ready: boolean
  end: () => Promise<void>
  refresh: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

/** Keeps the signed-in account in memory, resuming a stored oauth session on mount. */
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [did, setDid] = useState<string | null>(getStoredDid)

  const { data, isPending } = useQuery({
    queryKey: ['session', did],
    enabled: did !== null,
    queryFn: async (): Promise<Session | null> => {
      if (!did) {
        return null
      }
      if (!(await resumeSession(did))) {
        setDid(null)
        return null
      }

      const profile = await queryClient.fetchQuery(profileQuery(did))
      return {
        did,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })

  const end = useCallback(async () => {
    if (did) {
      await signOut(did)
    }
    queryClient.clear()
    setDid(null)
  }, [did, queryClient])

  const refresh = useCallback(() => {
    setDid(getStoredDid())
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session: data ?? null,
      ready: did === null || !isPending,
      end,
      refresh,
    }),
    [data, did, end, isPending, refresh],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

const useSession = (): SessionContextValue => {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession must be used inside a SessionProvider')
  }
  return value
}

export { useSession }
