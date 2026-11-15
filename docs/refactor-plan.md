# refactor plan: adopt official nuxt 4 structure

source of truth: official nuxt 4 docs (`nuxt.com/raw/docs/4.x/...`), read directly.
goal: reorganize to the recommended structure with no behavior change.

## commit strategy

- one commit per numbered point below, so each can be reviewed alone.
- tightly coupled points that cannot build independently are grouped and marked "(one commit)".
- run `pnpm test` and `pnpm lint` at the end of each phase.

## phase 0: baseline

1. run `pnpm test`, record pass/fail.
2. run `pnpm lint`, record pass/fail.

## phase 1: directory structure -> official nuxt 4

target layout:

```
app/
  assets/css/{fonts.css,global.css,paper.css,zen-kurenaido.css}
  components/*.vue
  composables/{use-session.ts,use-ruling-snap.ts,use-debounced-value.ts}
  pages/{index.vue,[...path].vue,hashtag/[tag].vue,oauth/callback.vue,profile/[actor].vue,profile/[actor]/list/[rkey].vue}
  plugins/vue-query.ts
  utils/{auth.ts,embed.ts,facets.ts,format.ts,oauth-scope.ts,query-client.ts,queries.ts,rpc.ts}
  app.vue
public/
test/
  setup.ts
  nuxt/
  unit/
nuxt.config.ts
```

1. (one commit) `git mv src app`; `git mv app/routes app/pages`; `git mv app/styles app/assets/css`; update `nuxt.config.ts` (`srcDir`, `dir`, `css`, tsconfig exclude), `eslint.config.mjs` globs, and imports so it builds again.
2. (one commit) split `app/lib`: move pure helpers to `app/utils/` and `use-*` files to `app/composables/`; rename `session.ts` -> `use-session.ts`; update imports.
3. (one commit) move tests to root `test/` layout (see phase 7) and update `vitest.config.ts`.

## phase 2: session and deprecated fetchQuery

1. rewrite `app/composables/use-session.ts` with `useState` instead of `provide`/`inject`; `useSession()` self-initializes; delete `useProvideSession`.
2. remove `useProvideSession()` and the TODO from `app/app.vue`.
3. replace `queryClient.fetchQuery(...)` with `queryClient.query(...)`.

## phase 3: component sfc order

1. flip every `.vue` to `script` -> `template` -> `style scoped`.
2. keep the type-export `<script lang="ts">` block before `<script setup>` in `group-sidebar.vue` and `person-tile.vue`.

## phase 4: auto-imports (nuxt way)

1. remove explicit vue api imports (`computed`, `ref`, `watch`, `nextTick`, `onMounted`, `withDefaults`, `defineProps`, `defineEmits`) from `.vue`.
2. remove explicit `useRoute` / `useRouter` imports from `.vue`.
3. remove explicit imports of auto-imported components/composables/utils from `.vue`.
4. keep non-auto imports (`@tanstack/vue-query`, `@atcute/*`, `ok`, `defineNuxtPlugin`, `definePageMeta`).

## phase 5: scoped styles

1. keep global: `:root` variables, `@property --cloth-hue`, font-face/style files, resets, focus-visible, shared layout (`.page`, `.notebook`, `.entries`, `.page-turn`, `.page-note`, `.list-title`, `.list-count`, `.notebook-root`, `.shelf-grid`), shared photo base (`.photo`, `.photo-image`, `.photo-tape`, `.photo-button`, `.photo-play-mark`, `.photo-video`, `.photos`).
2. scope per component: `cover`, `group-sidebar`, `shelf`, `person-tile`, `notebook-header`, `entry`, `embed-note`, `photo-viewer` (viewer-only parts), `avatar`, `rich-text`, 404 page.
3. use `:deep(...)` where a scoped selector must reach `RichText` anchors.
4. avoid scoping classes shared by more than one component; leave those global.

## phase 6: tests -> official `test/` layout

1. rewrite `vitest.config.ts` with `defineVitestProject` from `@nuxt/test-utils/config`:
   - `unit`: `test/unit/**/*.{test,spec}.ts`, node, `TZ=UTC`.
   - `nuxt`: `test/nuxt/**/*.{test,spec}.ts`, nuxt env, `setupFiles: ["test/setup.ts"]`, `TZ=UTC`.
   - `e2e`: `test/e2e/**/*.{test,spec}.ts`, node.
2. move pure tests to `test/unit/utils/` and `test/unit/assets/`: `format`, `embed`, `facets`, `oauth-scope`, `query-client`, `auth`, `queries`, `fonts`.
3. move component/page/app/session tests to `test/nuxt/`.
4. in `test/nuxt` tests, replace `vi.mock("../lib/...")` with `mockNuxtImport(...)`; use `renderSuspended` from `@nuxt/test-utils/runtime`.
5. simplify `test/utils/render.ts`: drop manual `AUTO_COMPONENTS`; keep fresh query client + router.
6. move `src/test/setup.ts` -> `test/setup.ts`; keep jsdom localStorage fix + `createTestQueryClient`.
7. relocate/verify `__mocks__/@atcute/oauth-browser-client.ts`; remove if unused.

## phase 7: remaining todos and pages

1. `pages/[...path].vue`: "this page is torn out" -> "404 not found"; rename `torn-page*` classes -> `not-found*`.
2. `pages/profile/[actor]/list/[rkey].vue`: "this page is torn out" -> "404 not found".
3. `pages/index.vue`: wrap conditional siblings in one root element (single-root requirement).
4. remove remaining `// TODO` comments.

## phase 8: verification

1. `pnpm test` passes (all projects).
2. `pnpm lint` (`nuxt typecheck && eslint .`) passes.
3. `pnpm build` succeeds.
4. no remaining `src/`, `routes/`, `lib/`, or "torn out" references.
