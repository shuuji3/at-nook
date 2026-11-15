<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// TODO: why dont use nuxt composable, not vue inject and provide?
import { useProvideSession } from "./composables/use-session";

useProvideSession();
</script>
