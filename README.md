# 📔 at-nook

**at-nook** /ət ˈnʊk/ is an atproto posts reader web app designed to provide a calm, comfortable experience without distractions. it aims to make users feel as if they are reading (or writing) at their own cozy nook at home.

built with [Nuxt](https://npmx.dev/package/nuxt) and [atcute](https://npmx.dev/package/@atcute/client). also check [credits page](https://at-nook.shuuji3.xyz/credits).

## guiding principles

- **pseudo-physical experience**: using physical cues such as paper, photos, books, stationery, and handwritten fonts
- **single author-centered continuous view**: presenting an author's posts like a handwritten notebook, rather than a typical timeline or feed mixing multiple authors into a single column
- **time to reflect**: helping users pause to reflect on their thoughts while reading or writing

## alpha version

this is currently an **alpha** version. this means:

- the app is still in an exploratory phase and is subject to drastic UI changes
- some core features are not yet implemented as I'm still finding what feels best to me
- it is still uncertain if/when the project will reach a beta version

## future ideas

- [ ] allow public view without login? but whose shelf should be used?
- [ ] find a good way to present reply threads: single-user notebook vs. multi-user exchanges?
- [ ] fix seemingly unstable session management?
- [ ] writing feature
- [ ] integrate margin.at using highlighter or sticky note expressions?
- [ ] integrate standard.site to read long posts?
- [ ] experiment with FedCM login experience?
- [ ] integrate masto.js for Mastodon? (but maybe need to limit some features requiring pds?)
- [ ] offer an option for pageless (current) vs. paginated views?
- [ ] per-author theme customization?
- [ ] find a way to chunk posts chronologically? (feasible without client-side store and many fetch? experience may vary depending on author posting frequency)
- [ ] liveness delay option: only show posts written up to a specific time (e.g., posts written up to 6am can be read starting from noon, a 6-hour wait). this can reduce the "random reward" expectation triggered by constant reloading, similar to gambling mechanics.
- [ ] freedom of choice for your favorite background photo?

## development

### run dev server

```shell
pnpm install
pnpm dev
```

you may need to configure oauth flow to use `localhost` callback and ensure `public/oauth-client-metadata.json` is publicly accessible from your pds.

### run prod build preview

```shell
pnpm build
pnpm preview
```
