<script lang="ts">
export interface Group {
  id: string;
  label: string;
  count?: number;
}
</script>

<script setup lang="ts">

defineProps<{
  groups: Group[];
  selected: string;
}>();

defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <nav class="groups" aria-label="groups">
    <button
      v-for="group in groups"
      :key="group.id"
      class="group-row"
      type="button"
      :aria-current="selected === group.id ? 'page' : undefined"
      @click="$emit('select', group.id)"
    >
      <span class="group-label">{{ group.label }}</span>
      <span v-if="group.count != null" class="group-count">{{ `${group.count}` }}</span>
    </button>
  </nav>
</template>
