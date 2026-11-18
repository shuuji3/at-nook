<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

interface Candidate {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}

const route = useRoute()
const inputText = ref('')
const chosen = ref<Candidate | null>(null)
const activeIndex = ref(-1)
const menuDismissed = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

const typedHandle = computed(() => stripAt(inputText.value))
const searchQuery = refDebounced(typedHandle, 300)

const { data: candidatesData } = useQuery({
  ...actorCandidatesQuery(searchQuery),
  enabled: computed(() => searchQuery.value.length >= 2),
})

const candidates = computed<Candidate[]>(() => (candidatesData.value?.actors ?? []).slice(0, 8))

const menuOpen = computed(() => candidates.value.length > 0 && !menuDismissed.value && !chosen.value)

const handle = computed(() => chosen.value?.handle ?? typedHandle.value)
const canSubmit = computed(() => handle.value.length > 0)

const loginFailed = computed(() => Boolean((route.query as { loginFailed?: string })?.loginFailed))

watch(inputText, () => {
  activeIndex.value = -1
  menuDismissed.value = false
})

function choose(person: Candidate) {
  chosen.value = person
  inputText.value = person.handle
  activeIndex.value = -1
}

function setActiveIndex(index: number) {
  activeIndex.value = index
}

async function signIn() {
  const target =
    menuOpen.value && activeIndex.value >= 0
      ? (candidates.value[activeIndex.value]?.handle ?? handle.value)
      : handle.value
  if (!target) return

  submitting.value = true
  error.value = null
  try {
    const url = await startLogin(target)
    window.location.assign(url.toString())
  } catch (cause) {
    submitting.value = false
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!menuOpen.value) {
      menuDismissed.value = false
      return
    }
    activeIndex.value = (activeIndex.value + 1) % candidates.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (menuOpen.value) {
      activeIndex.value = activeIndex.value <= 0 ? candidates.value.length - 1 : activeIndex.value - 1
    }
    return
  }

  if (event.key === 'Escape') {
    menuDismissed.value = true
    activeIndex.value = -1
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (menuOpen.value && activeIndex.value >= 0 && candidates.value[activeIndex.value]) {
      const person = candidates.value[activeIndex.value]!
      choose(person)
      return
    }
    void signIn()
  }
}

function onInput(event: Event) {
  inputText.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <section class="cover">
    <div class="cover-book">
      <span class="cover-spine" aria-hidden="true" />

      <div class="cover-face">
        <h1 class="cover-title"><span aria-hidden="true">📔</span>at-nook<sup class="cover-sup" aria-hidden="true">α</sup></h1>

        <div class="cover-name-line">
          <label class="cover-label" for="handle">handle</label>
          <div class="cover-input-row">
            <span class="cover-at" aria-hidden="true">@</span>
            <input
              id="handle"
              class="cover-input"
              role="combobox"
              :aria-expanded="menuOpen"
              aria-controls="cover-candidates"
              aria-autocomplete="list"
              :aria-activedescendant="menuOpen && activeIndex >= 0 ? `cover-candidate-${activeIndex}` : undefined"
              autocomplete="off"
              autofocus
              :spellcheck="false"
              :value="inputText"
              @input="onInput"
              @keydown="onKeyDown"
            />
          </div>

          <ul
            v-if="menuOpen"
            id="cover-candidates"
            class="cover-candidates"
            role="listbox"
            aria-label="candidates"
          >
            <li
              v-for="(person, index) in candidates"
              :id="`cover-candidate-${index}`"
              :key="person.did"
              class="cover-candidate"
              role="option"
              :aria-selected="index === activeIndex"
              @mousedown.prevent
              @mouseenter="setActiveIndex(index)"
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

        <button class="cover-open" type="button" :disabled="!canSubmit || submitting" @click="signIn">
          open notebook
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* the closed notebook */
.cover {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background: var(--nook-cover-backdrop);
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
  text-align: center;
  font-family: var(--font-hand);
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
}

.cover-sup {
  font-family: var(--font-sans);
  font-size: 3rem;
  font-weight: bold;
  margin-inline-start: 0.25rem;
  opacity: 0.7;
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
.cover-candidate[aria-selected='true'] {
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
  padding: 0.5rem;
  border: none;
  background: rgba(246, 234, 216, 0.22);
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
  border-bottom: 2px solid rgba(246, 234, 216, 0.6);
}

.cover-name {
  display: flex;
  align-items: center;
  height: 76px;
  margin: 0;
  padding-inline: 0.5rem;
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

@media (max-width: 640px) {
  .cover-book {
    width: min(100%, 540px);
    height: auto;
    max-height: 88svh;
  }

  .cover-face {
    gap: 14px;
    padding: 30px 24px;
  }

  .cover-title {
    height: auto;
    font-size: 2.6rem;
  }

  .cover-sup {
    font-size: 1.9rem;
  }

  .cover-at,
  .cover-input {
    font-size: 22px;
  }

  .cover-label,
  .cover-note {
    font-size: 15px;
  }

  .cover-name {
    height: 58px;
    font-size: 24px;
    line-height: 29px;
  }

  .cover-open {
    font-size: 20px;
  }

  .cover-candidate-handle,
  .cover-candidate-name {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .cover-book {
    animation: cloth-hue 24s linear infinite;
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
</style>
