import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { getStoredDid, resumeSession, signOut } from '../utils/auth'
import { profileQuery } from '../utils/queries'

export interface Session {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

interface SessionContextValue {
  session: Readonly<Ref<Session | null>>
  ready: Readonly<Ref<boolean>>
  end: () => Promise<void>
  refresh: () => void
}

/** Keeps the signed-in account in memory, resumes a stored oauth session on mount. */
export function useSession(): SessionContextValue {
  const queryClient = useQueryClient()
  const did = useState<string | null>('session-did', () => getStoredDid())

  const { data, isPending } = useQuery({
    queryKey: computed(() => ['session', did.value]),
    enabled: computed(() => did.value !== null),
    queryFn: async (): Promise<Session | null> => {
      if (!did.value) {
        return null
      }
      if (!(await resumeSession(did.value))) {
        did.value = null
        return null
      }

      const profile = await queryClient.query(profileQuery(() => did.value ?? ''))
      return {
        did: did.value,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })

  async function end() {
    if (did.value) {
      await signOut(did.value)
    }
    queryClient.clear()
    did.value = null
  }

  function refresh() {
    did.value = getStoredDid()
  }

  const session = computed(() => data.value ?? null)
  const ready = computed(() => did.value === null || !isPending.value)

  return { session, ready, end, refresh }
}
