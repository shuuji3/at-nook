<script setup lang="ts">
const { ready } = useSession()
</script>

<template>
  <div v-if="!ready">
    <!-- a stored session is resuming, so reads can use it -->
  </div>
  <Shelf v-else />
</template>
