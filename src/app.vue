<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useProvideSession } from "./lib/session";

useProvideSession();
</script>
