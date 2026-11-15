# 📔 at-nook

**at-nook** /ət ˈnʊk/ is a social posts reader web app designed to provide a calm, comfortable experience of reading social media without distractions. it aims to make users feel as if they are reading (or writing) at their own cozy nook at home.

the main guiding principles of at-nook include:
- **pseudo-physical experience**: using physical cues such as paper, photos, books, stationery, and handwritten fonts
- **single author-centered continuous view**: presenting an author's posts like a handwritten notebook, rather than a typical timeline or feed mixing multiple authors into a single column
- others?

## credits

- built with [Nuxt](https://npmx.dev/package/nuxt) and [atcute](https://npmx.dev/package/@atcute/client)
- cover photo credit: ["nook" by kharlamovaa / cc-by-2.0](https://www.flickr.com/photos/kharlamovaa/5580663027/)

## alpha version
this is currently an **alpha** version. this means:
- the app is still in an exploratory phase and is subject to drastic UI changes
- some core features are not yet implemented as I'm still finding what feels best to me
- it is still uncertain if/when the project will reach a beta version

## maybe TODO
- [ ] find a good way to present reply threads: single-user notebook vs. multi-user exchanges?
- [ ] fix seemingly unstable session management?
- [ ] integrate margin.at using highlighter or sticky note expressions?
- [ ] experiment with FedCM login experience?
- [ ] integrate masto.js for Mastodon?

## development

```shell
pnpm install
pnpm dev
```

you may need to configure oauth flow to use `localhost` callback and ensure `public/oauth-client-metadata.json` is publicly accessible from your pds.

build the application for production and preview it locally:

```shell
pnpm build
pnpm preview
```
