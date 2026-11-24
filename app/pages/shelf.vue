<script setup lang="ts">
const { session, ready } = useSession()
</script>

<template>
  <div v-if="!ready"></div>
  <div v-else-if="!session">
    <section class="shelf-gate">
      <h1 class="shelf-gate-title">
        a piece of your session is missing somewhere. please
        <NuxtLink to="/">open your notebook from the cover</NuxtLink>
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
  background: var(--nook-cover-backdrop);
}

.shelf-gate-title {
  font-family: var(--font-hand);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 400;
  color: var(--paper);
}

.shelf-gate-title a {
  color: var(--paper);
}
</style>
