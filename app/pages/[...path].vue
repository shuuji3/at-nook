<template>
  <section class="torn-page">
    <!-- TODO:  'torn out' is not good phrase. dont use this phrase in any pages in entire app -->
    <h1 class="torn-page-title">this page is torn out</h1>
    <NuxtLink class="torn-page-link" to="/">back to the cover</NuxtLink>
  </section>
</template>

<style scoped>
/* a page that was never bound */
.torn-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: var(--paper);
  color: var(--ink);
}

.torn-page-title {
  margin: 0;
  font-family: var(--font-hand);
  font-size: clamp(36px, 7vw, 64px);
  font-weight: 400;
}

.torn-page-link {
  font-family: var(--font-hand);
  font-size: 22px;
  color: var(--ink);
}
</style>
