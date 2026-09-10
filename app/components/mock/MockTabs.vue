<template>
  <div class="tabs" :class="{ 'tabs-baseline': baseline }">
    <div v-for="t in items" :key="t" class="tab" :class="{ active: t === value }">{{ t }}</div>
  </div>
</template>

<script setup lang="ts">
/** Portage de `Tabs` : navigation (avec ligne de base) ou contrôle segmenté (`baseline=false`). */
withDefaults(defineProps<{ items: string[]; value: string; baseline?: boolean }>(), { baseline: true });
</script>

<style scoped>
.tabs {
  display: flex;
  width: 100%;
  gap: 2px;
}
.tabs-baseline {
  border-bottom: 2px solid var(--accent);
}
.tab {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  font-size: 16px;
  color: var(--text);
  background: var(--close-btn-bg);
  border: 2px solid var(--card-edge);
  border-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab.active {
  background: var(--accent);
  color: var(--accent-text);
  border-color: var(--accent);
}
</style>
