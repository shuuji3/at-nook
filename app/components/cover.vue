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
    <a
      class="cover-credit"
      href="https://www.flickr.com/photos/kharlamovaa/5580663027/"
      target="_blank"
      rel="noopener noreferrer"
    >
      credit: photo "nook" by kharlamovaa / cc-by-2.0
    </a>
  </section>
</template>

<style scoped>
/* the closed notebook */
.cover {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background:
    linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url(/images/5580663027_deeb68abf8_o-flickr-kharlamovaa-cc-by-2.0.jpg) center / cover no-repeat;
}

/* a closed book standing on the desk */
.cover-book {
  position: relative;
  width: min(540px, 92vw);
  height: min(720px, 88svh);
  display: flex;
  border-radius: 4px 14px 14px 4px;
  background-color: hsl(from var(--cloth) calc(h + 120 + var(--cloth-hue)) s l);
  background-image:
    radial-gradient(ellipse at 25% 8%, rgba(255, 255, 255, 0.1), transparent 55%),
    radial-gradient(ellipse at 85% 95%, rgba(0, 0, 0, 0.28), transparent 60%),
    repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 0 2px, transparent 2px 5px);
  box-shadow:
    0 26px 50px rgba(43, 58, 85, 0.42),
    inset -18px 0 26px -22px rgba(0, 0, 0, 0.75);
  color: #f6ead8;
}

/* the sewn edge of the binding */
.cover-spine {
  flex: 0 0 22px;
  border-radius: 3px 0 0 3px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.12) 70%, transparent);
  box-shadow: inset -2px 0 3px rgba(0, 0, 0, 0.4);
}

.cover-face {
  flex: 1 1 auto;
  display: grid;
  align-content: center;
  gap: 18px;
  padding: 44px 34px;
}

.cover-title {
  height: 96px;
  margin: 0;
  font-family: var(--font-hand);
  font-size: 72px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
}

.cover-name-line {
  position: relative;
  display: grid;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 2px solid rgba(246, 234, 216, 0.6);
}

/*
 * the menu is a popover: it opens below the handle line, out of flow, so it
 * cannot push the cover or grow the book
 */
.cover-candidates {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 5;
  display: grid;
  align-content: start;
  gap: 2px;
  margin: 6px 0 0;
  padding: 6px;
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 6px;
  background: var(--ink);
  box-shadow: 0 14px 28px rgba(20, 12, 10, 0.45);
}

.cover-candidate {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  background: rgba(246, 234, 216, 0.08);
  color: inherit;
  font-family: var(--font-hand);
  cursor: pointer;
}

.cover-candidate:hover,
.cover-candidate[aria-selected="true"] {
  background: rgba(246, 234, 216, 0.22);
}

.cover-candidate-handle {
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-candidate-name {
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-input-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.cover-at {
  font-family: var(--font-hand);
  font-size: 30px;
  color: #ffe9b8;
}

.cover-label {
  font-family: var(--font-hand);
  font-size: 20px;
  opacity: 0.75;
}

.cover-input {
  width: 100%;
  padding: 8px 4px;
  border: none;
  border-bottom: 1px dashed rgba(246, 234, 216, 0.4);
  background: transparent;
  color: inherit;
  font-family: var(--font-hand);
  font-size: 30px;
}

.cover-input::placeholder {
  color: rgba(246, 234, 216, 0.4);
}

/* every block has a reserved height, so filling the name never shifts the cover */
.cover-name-field {
  display: grid;
  gap: 4px;
}

.cover-name {
  height: 76px;
  margin: 0;
  overflow: hidden;
  font-family: var(--font-hand);
  font-size: 32px;
  line-height: 38px;
  color: #ffe9b8;
}

.cover-note {
  min-height: 32px;
  margin: 0;
  font-family: var(--font-hand);
  font-size: 20px;
  color: #ffd9cf;
}

.cover-open {
  justify-self: center;
  padding: 10px 26px;
  border: 2px solid rgba(246, 234, 216, 0.8);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font-family: var(--font-hand);
  font-size: 26px;
  cursor: pointer;
}

.cover-open:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: no-preference) {
  .cover-book {
    animation: cloth-hue 30s linear infinite;
  }

  @keyframes cloth-hue {
    from {
      --cloth-hue: 0;
    }
    to {
      --cloth-hue: 360;
    }
  }
}

/* photo credit */
.cover-credit {
  position: fixed;
  bottom: 10px;
  right: 12px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--paper);
  font-family: var(--font-hand);
  font-size: 16px;
  text-decoration: none;
}
</style>
