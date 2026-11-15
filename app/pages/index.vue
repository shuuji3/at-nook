<script setup lang="ts">

const { session, ready } = useSession();
</script>

<template>
  <div>
    <Cover v-if="ready && !session" />
    <Shelf v-else-if="ready && session" />
  </div>
</template>
