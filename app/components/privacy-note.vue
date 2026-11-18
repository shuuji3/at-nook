<script setup lang="ts"></script>
<template>
  <NotebookShell>
    <h1 class="list-title">privacy policy</h1>
    <div class="entries">
      <p class="note-text">
        at-nook is still in alpha, so this privacy policy is subject to change at any time.
      </p>
      <p class="note-text">
        at-nook uses self-hosted Umami analytics, running on a small server in my home, to measure
        access counts and understand the app's usage. no data is shared with any other parties.
      </p>
      <p class="note-text">
        even though no data is ever shared with third parties, at-nook also respects the privacy
        signals sent by your browser, such as
        <a
          href="https://en.wikipedia.org/wiki/Global_Privacy_Control"
          target="_blank"
          rel="noopener"
          >Global Privacy Control</a
        >
        (GPC) and the deprecated
        <a href="https://en.wikipedia.org/wiki/Do_Not_Track" target="_blank" rel="noopener"
          >Do Not Track</a
        >
        (DNT), still used by Chrome and Edge. before sending tracking ping to the umami server, the
        app checks `navigator.globalPrivacyControl` and fallbacks to `navigator.doNotTrack` when the
        GPC is unavailable.
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

  & a {
    color: inherit;
  }
}
</style>
