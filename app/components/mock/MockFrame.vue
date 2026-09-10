<template>
  <div class="wf" :style="{ padding: `${padding}px` }">
    <div class="wf-outer">
      <div class="wf-surface">
        <div class="wf-inner" />
      </div>
    </div>
    <div class="wf-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Portage CSS de `WoodenFrame` (mobile) : biseau extérieur 2 DP, surface plate 4 DP,
 * biseau intérieur inversé 2 DP — 8 DP de bordure, contenu inséré à `padding` (20 par
 * défaut, 8 pour la barre du bas). Le placeholder de l'app, en attendant l'art du cadre.
 */
withDefaults(defineProps<{ padding?: number }>(), { padding: 20 });
</script>

<style scoped>
.wf {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.wf-outer {
  position: absolute;
  inset: 0;
  border: 2px solid;
  border-color: #7d6448 #352818 #352818 #7d6448;
  pointer-events: none;
}
.wf-surface {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 4px solid #4d3015;
}
.wf-inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid;
  border-color: #352818 #7d6448 #7d6448 #352818;
  background: #1a1410;
}
.wf-content {
  position: relative;
  z-index: 3;
  flex: 1;
  min-height: 0;
}
</style>
