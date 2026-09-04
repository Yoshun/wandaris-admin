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
  fill: "#c4a882",
});
</script>

<style scoped>
.bar {
  position: relative;
  width: 100%;
  border: 2px solid #0d0906;
  background: #2a2218;
  overflow: hidden;
  display: flex;
}
.bar-seg {
  background: #0d0906;
  gap: 2px;
}
.seg {
  flex: 1;
  background: #2a2218;
}
.seg.on {
  background: #c4a882;
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
  color: #f0e6d2;
  text-shadow: 1px 1px 0 #000;
}
</style>
