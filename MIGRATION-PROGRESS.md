# Nuxt Migration Progress

## Status: MIGRATION COMPLETE — verification passes

### Done ✓
- [x] **Chunk 0**: Move src/ → ref/src/ (reference)
- [x] **Chunk 1**: Nuxt scaffold via `pnpm create nuxt@latest` + deps install
- [x] **Chunk 2**: lib/queries.ts — swap react-query → vue-query
- [x] **Chunk 3**: lib/session.ts — convert React Context → Vue provide/inject composable
- [x] **Chunk 4**: lib/use-debounced-value.ts + use-ruling-snap.ts — convert to Vue composables
- [x] **Chunk 5**: components/notebook-shell + avatar + person-tile + group-sidebar
- [x] **Chunk 6**: components/rich-text + photo-viewer + photo + video-print
- [x] **Chunk 7**: components/embed-note + entry + notebook-header
- [x] **Chunk 8**: components/cover + shelf
- [x] **Chunk 9**: Nuxt pages (index, callback, hashtag/tag, profile/[actor], profile/[actor]/list/[rkey], [...path])
- [x] **Chunk 10**: app/app.vue root with SessionProvider + NuxtPage
- [x] **Chunk 11**: Lib unit tests — all passing
- [x] **Chunk 12**: Component and route tests — all reference tests ported

### Verification
- [x] `pnpm lint` — typecheck and eslint pass (5 optional-prop warnings)
- [x] `pnpm build` — builds clean
- [x] `pnpm exec nuxt typecheck` — 0 source errors
- [x] `pnpm test` — 73 tests, 19 files, all passing

### Tests
Every reference test is ported 1-to-1:
- component: embed-note, entry, photo, video-print, cover, shelf
- route: callback, list-grid, notebook
- app, session, and all lib unit tests

### File mapping (1-to-1)
| React (ref/src/) | Nuxt (src/) |
|---|---|
| src/app.tsx | src/app.vue |
| src/app.test.tsx | src/app.test.ts |
| src/main.tsx | src/plugins/vue-query.ts + nuxt.config.ts |
| src/routes/cover.tsx | src/components/cover.vue |
| src/routes/home.tsx | src/routes/index.vue |
| src/routes/shelf.tsx | src/components/shelf.vue |
| src/routes/notebook.tsx | src/routes/profile/[actor].vue |
| src/routes/list-grid.tsx | src/routes/profile/[actor]/list/[rkey].vue |
| src/routes/hashtag.tsx | src/routes/hashtag/[tag].vue |
| src/routes/callback.tsx | src/routes/oauth/callback.vue |
| src/routes/not-found.tsx | src/routes/[...path].vue |
| src/components/*.tsx | src/components/*.vue |
| src/lib/*.tsx/.ts | src/lib/*.ts (queries→vue-query, session→composable) |
| src/styles/*.css | src/styles/*.css (unchanged) |
| src/test/render.tsx | src/test/render.ts |
| src/test/setup.ts | src/test/setup.ts (vitest) |
| vite.config.ts | nuxt.config.ts + vitest.config.ts |
| index.html | nuxt.config.ts `app.head` |
