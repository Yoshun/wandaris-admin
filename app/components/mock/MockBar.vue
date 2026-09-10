<template>
  <div class="bar" :class="{ 'bar-seg': segments }" :style="{ height: `${height}px` }">
    <template v-if="segments">
      <div v-for="i in segments" :key="i" class="seg" :class="{ on: i <= Math.round(value * segments) }" />
    </template>
    <template v-else>
      <div class="fill" :style="{ width: `${Math.round(value * 100)}%`, background: fill }" />
      <span v-if="label" class="label">{{ label }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
/** Portage de `ProgressBar` : continue (PV, XP de métier) ou en blocs (`segments`) pour une valeur discrète. */
withDefaults(defineProps<{ value: number; segments?: number; label?: string; height?: number; fill?: string }>(), {
  segments: 0,
  label: "",
  height: 14,
  fill: "var(--bar-fill)",
});
</script>

<style scoped>
.bar {
  position: relative;
  width: 100%;
  border: 2px solid var(--bar-border);
  background: var(--bar-track);
  overflow: hidden;
  display: flex;
}
.bar-seg {
  background: var(--bar-border);
  gap: 2px;
}
.seg {
  flex: 1;
  background: var(--bar-track);
}
.seg.on {
  background: var(--bar-fill);
}
.fill {
  height: 100%;
}
.label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--contrast-text);
  text-shadow: 1px 1px 0 var(--shadow);
}
</style>
