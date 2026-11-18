<template>
  <footer class="site-footer">
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
    <NuxtLink class="site-footer-link" to="/privacy">privacy</NuxtLink>
    <NuxtLink class="site-footer-link" to="/terms">terms</NuxtLink>
    <NuxtLink class="site-footer-link" to="/credits">credits</NuxtLink>
  </footer>
</template>

<style scoped>
.site-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
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
