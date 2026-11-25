<script setup lang="ts">
const { version, commit } = useRuntimeConfig().public
const build = version
</script>
<template>
  <footer class="site-footer">
    <NuxtLink class="site-footer-link" to="/">home</NuxtLink>
    <NuxtLink class="site-footer-link" to="/about">about</NuxtLink>
    <NuxtLink class="site-footer-link" to="/privacy">privacy</NuxtLink>
    <NuxtLink class="site-footer-link" to="/terms">terms</NuxtLink>
    <NuxtLink class="site-footer-link" to="/credits">credits</NuxtLink>
    <span class="site-footer-icons">
      <a
        class="site-footer-link"
        href="https://github.com/shuuji3/at-nook"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="source on github"
        title="source on github"
      >
        <Icon class="site-footer-icon" name="simple-icons:github" />
      </a>
      <a
        class="site-footer-link"
        href="https://tangled.org/shuuji3.xyz/at-nook"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="source on tangled"
        title="source on tangled"
      >
        <Icon class="site-footer-icon" name="simple-icons:tangled" />
      </a>
      <span v-if="build" class="site-footer-version">
        <a
          v-if="commit"
          class="site-footer-link"
          :href="`https://github.com/shuuji3/at-nook/commit/${commit}`"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="view this commit"
          title="view this commit"
        >{{ build }}</a>
        <template v-else>{{ build }}</template>
      </span>
    </span>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-block-start: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 0 0.9em;
  padding: 0.6rem 1rem;
  color: var(--paper);
  font-family: var(--font-hand);
  font-size: 18px;
}

.site-footer-link {
  color: inherit;
}

.site-footer-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

.site-footer-icons {
  display: flex;
  align-items: center;
  gap: 0 1em;
}

@media (max-width: 640px) {
  .site-footer-icons {
    flex-basis: 100%;
    justify-content: center;
  }
}
</style>
