<template>
  <section class="not-found">
    <h1 class="not-found-title">404 not found</h1>
    <NuxtLink class="not-found-link" to="/">back to the cover</NuxtLink>
  </section>
</template>

<style scoped>
/* a page that was never bound */
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: var(--paper);
  color: var(--ink);
}

.not-found-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: clamp(36px, 7vw, 64px);
  font-weight: 400;
}

.not-found-link {
  font-family: var(--font-hand);
  font-size: 22px;
  color: var(--ink);
}
</style>
