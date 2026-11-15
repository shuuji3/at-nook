<script setup lang="ts">

const { session, ready } = useSession();
</script>

<template>
  <Cover v-if="ready && !session" />
  <Shelf v-else-if="ready && session" />
</template>
