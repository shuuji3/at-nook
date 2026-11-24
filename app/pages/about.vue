<template>
  <NotebookShell>
    <h1 class="list-title">about</h1>
    <div class="entries">
      <p class="note-text">
        at-nook is an atproto posts reader web app designed to provide a calm, comfortable
        experience without distractions. it aims to make users feel as if they are reading (or
        writing) at their own cozy nook at home.
      </p>
      <ul class="note-list">
        <li>
          <strong>pseudo-physical experience</strong>: using physical cues such as paper, photos,
          books, stationery, and handwritten fonts
        </li>
        <li>
          <strong>single author-centered continuous view</strong>: presenting an author's posts like
          a handwritten notebook, rather than a typical timeline or feed mixing multiple authors
          into a single column
        </li>
        <li>
          <strong>time to reflect</strong>: helping users pause to reflect on their thoughts while
          reading or writing
        </li>
      </ul>
      <p class="note-text">
        at-nook is still an alpha version. the app is in an exploratory phase, so the ui is subject
        to drastic changes, and some core features are not yet implemented.
      </p>
    </div>
  </NotebookShell>
</template>

<style scoped>
.entries {
  flex: 1;
  align-content: start;
}

.note-text {
  margin: 0;
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink);
}

.note-list {
  margin: 0;
  padding-inline-start: 1.5em;
  list-style: disc;
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: var(--line-height);
  color: var(--ink);
}
</style>
