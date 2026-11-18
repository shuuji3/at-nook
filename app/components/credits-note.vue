<template>
  <NotebookShell>
    <h1 class="list-title">credits</h1>
    <div class="entries">
      <p class="note-text">
        background photo:
        <a
          href="https://www.flickr.com/photos/kharlamovaa/5580663027/"
          target="_blank"
          rel="noopener noreferrer"
        >
          "nook" by kharlamovaa
        </a>
        (<a
          target="_blank"
          rel="noopener noreferrer"
          href="https://creativecommons.org/licenses/by/2.0/deed.en"
          >cc-by-2.0</a
        >)
      </p>
      <p class="note-text">
        built with
        <a href="https://npmx.dev/package/nuxt" target="_blank" rel="noopener">Nuxt</a>
        and
        <a href="https://npmx.dev/package/@atcute/client" target="_blank" rel="noopener">atcute</a>
      </p>
    </div>
  </NotebookShell>
</template>

<style scoped>
.entries {
  flex: 1;
}

.note-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink);
}

.note-text a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
