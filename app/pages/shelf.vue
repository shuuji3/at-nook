<script setup lang="ts">
const { session, ready } = useSession();
</script>

<template>
  <div v-if="!ready">
    <!-- loading state, nothing to show yet -->
  </div>
  <div v-else-if="!session">
    <section class="shelf-gate">
      <h1 class="shelf-gate-title">
        open the notebook from the <NuxtLink to="/">cover</NuxtLink> first
      </h1>
    </section>
  </div>
  <Shelf v-else />
</template>

<style scoped>
.shelf-gate {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background: var(--paper-shadow);
}

.shelf-gate-title {
  font-family: var(--font-hand);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 400;
  color: var(--ink);
}

.shelf-gate-title a {
  color: var(--ink);
}
</style>