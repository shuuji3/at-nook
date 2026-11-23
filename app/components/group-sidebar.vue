<script lang="ts">
export interface Group {
  id: string
  label: string
  count?: number
}
</script>

<script setup lang="ts">
defineProps<{
  groups: Group[]
  selected: string
}>()

defineEmits<{
  select: [id: string]
}>()
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

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-content: start;
}

.group-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 22px;
  text-align: left;
  cursor: pointer;
}

.group-row[aria-current='page'] {
  background: rgba(43, 58, 85, 0.1);
}

.group-count {
  color: var(--ink-soft);
  font-size: 16px;
}

@media (max-width: 900px) {
  .groups {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px 8px;
  }
}
</style>
