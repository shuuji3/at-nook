<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const umamiHost = runtimeConfig.public.umamiHost
</script>

<template>
  <NotebookShell>
    <h1 class="list-title">privacy policy</h1>
    <div class="entries">
      <p class="note-text">
        at-nook is still in alpha, so this privacy policy is subject to change at any time.
      </p>
      <p class="note-text">
        at-nook uses self-hosted Umami analytics, running on a small server in my home, to measure
        access counts and understand the app's usage. no data is shared with any other parties. if
        you want to this first party tracking, you could do it by blocking `{{
          umamiHost
        }}/script.js` .
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
