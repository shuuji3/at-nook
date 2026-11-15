<template>
  <Cover v-if="ready && !session" />
  <Shelf v-else-if="ready && session" />
</template>

<script setup lang="ts">
import { useSession } from "../composables/use-session";

const { session, ready } = useSession();
</script>
