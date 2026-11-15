import { useQuery, useQueryClient } from "@tanstack/vue-query";
// TODO: why dont use nuxt composable, not vue inject and provide?
import { computed, inject, provide, ref, type InjectionKey, type Ref } from "vue";
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

const SessionKey: InjectionKey<SessionContextValue> = Symbol("session");

/** Keeps the signed-in account in memory, resumes a stored oauth session on mount. */
export const useProvideSession = (): SessionContextValue => {
  const queryClient = useQueryClient();
  const did = ref<string | null>(getStoredDid());

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

      // TODO: fetchQuery is deprecated
      const profile = await queryClient.fetchQuery(profileQuery(() => did.value ?? ""));
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

  const ctx: SessionContextValue = { session, ready, end, refresh };
  // TODO: why dont use nuxt composable, not vue inject and provide?
  provide(SessionKey, ctx);
  return ctx;
};

export const useSession = (): SessionContextValue => {
  // TODO: why dont use nuxt composable, not vue inject and provide?
  const value = inject(SessionKey);
  if (!value) {
    throw new Error("useSession must be used inside a SessionProvider");
  }
  return value;
};
