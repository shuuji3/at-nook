<script setup lang="ts">
const { version, commitHash } = useRuntimeConfig().public
const build = version && commitHash ? `${version} (${commitHash})` : version || commitHash
</script>
<template>
  <footer class="site-footer">
    <NuxtLink class="site-footer-link" to="/">home</NuxtLink>
    <NuxtLink class="site-footer-link" to="/about">about</NuxtLink>
    <NuxtLink class="site-footer-link" to="/privacy">privacy</NuxtLink>
    <NuxtLink class="site-footer-link" to="/terms">terms</NuxtLink>
    <NuxtLink class="site-footer-link" to="/credits">credits</NuxtLink>
    <a
      class="site-footer-link"
      href="https://github.com/shuuji3/at-nook"
      target="_blank"
      rel="noopener noreferrer"
    >
      github
    </a>
    <a
      class="site-footer-link"
      href="https://tangled.org/shuuji3.xyz/at-nook"
      target="_blank"
      rel="noopener noreferrer"
    >
      tangled
    </a>
    <span v-if="build" class="site-footer-version">{{ build }}</span>
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
</style>
