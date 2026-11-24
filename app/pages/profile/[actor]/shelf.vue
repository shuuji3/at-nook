<script setup lang="ts">
const route = useRoute()
const actor = computed(() => (route.params.actor as string) ?? '')
</script>

<template>
  <Shelf :actor="actor" />
</template>
