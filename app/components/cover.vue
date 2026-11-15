<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

interface Candidate {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

const route = useRoute();
const raw = ref("");
const chosen = ref<Candidate | null>(null);
const active = ref(-1);
const dismissed = ref(false);
const opening = ref(false);
const error = ref<string | null>(null);

const typed = computed(() => stripAt(raw.value));
const query = useDebouncedValue(typed, 300);

const { data: candidatesData } = useQuery({
  ...actorCandidatesQuery(query),
  enabled: computed(() => query.value.length >= 2),
});

const people = computed<Candidate[]>(
  () => (candidatesData.value?.actors ?? []).slice(0, 8),
);

const open = computed(
  () => people.value.length > 0 && !dismissed.value && !chosen.value,
);

const handle = computed(() => chosen.value?.handle ?? typed.value);
const canOpen = computed(() => handle.value.length > 0);

const loginFailed = computed(() => Boolean((route.query as { loginFailed?: string })?.loginFailed));

watch(raw, () => {
  active.value = -1;
  dismissed.value = false;
});

const choose = (person: Candidate) => {
  chosen.value = person;
  raw.value = person.handle;
  active.value = -1;
};

const setActive = (index: number) => {
  active.value = index;
};

const signIn = async () => {
  const target =
    open.value && active.value >= 0
      ? (people.value[active.value]?.handle ?? handle.value)
      : handle.value;
  if (!target) return;

  opening.value = true;
  error.value = null;
  try {
    const url = await startLogin(target);
    window.location.assign(url.toString());
  } catch (cause) {
    opening.value = false;
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) {
      dismissed.value = false;
      return;
    }
    active.value = (active.value + 1) % people.value.length;
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (open.value) {
      active.value = active.value <= 0 ? people.value.length - 1 : active.value - 1;
    }
    return;
  }

  if (event.key === "Escape") {
    dismissed.value = true;
    active.value = -1;
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    if (open.value && active.value >= 0 && people.value[active.value]) {
      const person = people.value[active.value]!;
      choose(person);
      return;
    }
    void signIn();
  }
};

const onInput = (event: Event) => {
  raw.value = (event.target as HTMLInputElement).value;
};
</script>

<template>
  <section class="cover">
    <div class="cover-book">
      <span class="cover-spine" aria-hidden="true" />

      <div class="cover-face">
        <h1 class="cover-title">at-nook</h1>

        <div class="cover-name-line">
          <label class="cover-label" for="handle">handle</label>
          <div class="cover-input-row">
            <span class="cover-at" aria-hidden="true">@</span>
            <input
              id="handle"
              class="cover-input"
              role="combobox"
              :aria-expanded="open"
              aria-controls="cover-candidates"
              aria-autocomplete="list"
              :aria-activedescendant="open && active >= 0 ? `cover-candidate-${active}` : undefined"
              autocomplete="off"
              :spellcheck="false"
              :value="raw"
              @input="onInput"
              @keydown="onKeyDown"
            >
          </div>

          <ul
            v-if="open"
            id="cover-candidates"
            class="cover-candidates"
            role="listbox"
            aria-label="people"
          >
            <li
              v-for="(person, index) in people"
              :id="`cover-candidate-${index}`"
              :key="person.did"
              class="cover-candidate"
              role="option"
              :aria-selected="index === active"
              @mousedown.prevent
              @mouseenter="setActive(index)"
              @click="choose(person)"
            >
              <Avatar :src="person.avatar" :alt="person.displayName ?? person.handle" :size="28" />
              <span>
                <span class="cover-candidate-handle">@{{ person.handle }}</span>
                <span class="cover-candidate-name">
                  ({{ person.displayName ?? person.handle }})
                </span>
              </span>
            </li>
          </ul>
        </div>

        <div class="cover-name-field">
          <span class="cover-label">name</span>
          <p class="cover-name" aria-live="polite">
            {{ chosen ? (chosen.displayName ?? chosen.handle) : '' }}
          </p>
        </div>

        <p class="cover-note">
          {{ error ?? (loginFailed ? 'sign-in did not finish. try again.' : '') }}
        </p>

        <button
          class="cover-open"
          type="button"
          :disabled="!canOpen || opening"
          @click="signIn"
        >
          open notebook
        </button>
      </div>
    </div>
  </section>
</template>
