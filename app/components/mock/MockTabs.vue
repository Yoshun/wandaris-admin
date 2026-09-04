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
  border-bottom: 2px solid #c4a882;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  font-size: 16px;
  color: #c8b898;
  background: #2a2218;
  border: 2px solid #1e140c;
  border-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab.active {
  background: #c4a882;
  color: #1a1410;
  border-color: #c4a882;
}
</style>
