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

<script setup lang="ts">
import { computed } from "vue";
import { toFacetSegments } from "../utils/facets";

const props = defineProps<{
  text: string;
  facets?: unknown;
}>();

const segments = computed(() => toFacetSegments(props.text, props.facets));
</script>
