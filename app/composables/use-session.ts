import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getStoredDid, resumeSession, signOut } from "../utils/auth";
import { profileQuery } from "../utils/queries";

export interface Session {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

interface SessionContextValue {
  session: Readonly<Ref<Session | null>>;
  ready: Readonly<Ref<boolean>>;
  end: () => Promise<void>;
  refresh: () => void;
}

/** Keeps the signed-in account in memory, resumes a stored oauth session on mount. */
export const useSession = (): SessionContextValue => {
  const queryClient = useQueryClient();
  const did = useState<string | null>("session-did", () => getStoredDid());

  onMounted(() => {
    // the server has no localStorage, so it ships `did: null` in the payload
    // and the client skips the initializer during hydration; re-read the
    // stored did on mount so a full reload keeps the signed-in account
    if (did.value === null) {
      did.value = getStoredDid();
    }
  });

  const { data, isPending } = useQuery({
    queryKey: computed(() => ["session", did.value]),
    enabled: computed(() => did.value !== null),
    queryFn: async (): Promise<Session | null> => {
      if (!did.value) {
        return null;
      }
      if (!(await resumeSession(did.value))) {
        did.value = null;
        return null;
      }

      const profile = await queryClient.query(profileQuery(() => did.value ?? ""));
      return {
        did: did.value,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      };
    },
    retry: false,
    staleTime: 5 * 60_000,
  });

  const end = async () => {
    if (did.value) {
      await signOut(did.value);
    }
    queryClient.clear();
    did.value = null;
  };

  const refresh = () => {
    did.value = getStoredDid();
  };

  const session = computed(() => data.value ?? null);
  const ready = computed(() => did.value === null || !isPending.value);

  return { session, ready, end, refresh };
};
