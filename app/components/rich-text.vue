<script setup lang="ts">

const props = defineProps<{
  text: string;
  facets?: unknown;
}>();

const segments = computed(() => toFacetSegments(props.text, props.facets));
</script>

<template>
  <template v-for="(segment, index) in segments" :key="index">
    <NuxtLink
      v-if="segment.href && segment.href.startsWith('/')"
      class="rich-link"
      :to="segment.href"
    >
      {{ segment.text }}
    </NuxtLink>
    <a
      v-else-if="segment.href"
      class="rich-link"
      :href="segment.href"
      target="_blank"
      rel="noreferrer"
    >
      {{ segment.text }}
    </a>
    <span v-else>{{ segment.text }}</span>
  </template>
</template>

<style scoped>
.rich-link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
