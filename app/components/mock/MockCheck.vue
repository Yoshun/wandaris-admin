<template>
  <div class="ck">
    <span class="box" :class="{ on: checked }">{{ checked ? "✓" : "" }}</span>
    <span class="label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
/** Portage de `Checkbox` : l'état est porté par une marque, pas par une nuance de fond. */
defineProps<{ label: string; checked: boolean }>();
</script>

<style scoped>
.ck {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}
.box {
  width: 22px;
  height: 22px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--input-bg);
  border: 2px solid;
  border-color: var(--frame-bevel-dark) var(--frame-bevel-light) var(--frame-bevel-light) var(--frame-bevel-dark);
  color: var(--accent);
  font-size: 18px;
  line-height: 1;
}
.label {
  font-size: 16px;
  color: var(--text);
}
</style>
