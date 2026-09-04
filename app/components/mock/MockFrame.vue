<template>
  <div class="wf" :style="{ padding: `${padding}px` }">
    <div class="wf-fill" />
    <div class="wf-edge wf-top"><img :src="'/mock/edge-top@2x.png'" alt="" /></div>
    <div class="wf-edge wf-bottom"><img :src="'/mock/edge-bottom@2x.png'" alt="" /></div>
    <div class="wf-edge wf-left"><img :src="'/mock/edge-left@2x.png'" alt="" /></div>
    <div class="wf-edge wf-right"><img :src="'/mock/edge-right@2x.png'" alt="" /></div>
    <img class="wf-corner wf-tl" :src="'/mock/corner-tl@2x.png'" alt="" />
    <img class="wf-corner wf-tr" :src="'/mock/corner-tr@2x.png'" alt="" />
    <img class="wf-corner wf-bl" :src="'/mock/corner-bl@2x.png'" alt="" />
    <img class="wf-corner wf-br" :src="'/mock/corner-br@2x.png'" alt="" />
    <div class="wf-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Portage CSS de `WoodenFrame` (mobile) : coins 36 DP, planches 14 DP, marge
 * transparente de 2 DP, fond en dégradé diagonal, ombre portée dure de 10 DP.
 * Mêmes découpes 9-slice que l'app (`public/mock/`).
 */
withDefaults(defineProps<{ padding?: number }>(), { padding: 28 });
</script>

<style scoped>
.wf {
  position: relative;
  filter: drop-shadow(10px 10px 0 #000);
}
.wf-fill {
  position: absolute;
  inset: 4px;
  background: linear-gradient(160deg, #2c2016 0%, #160f0a 100%);
}
.wf-corner {
  position: absolute;
  width: 36px;
  height: 36px;
  image-rendering: pixelated;
  pointer-events: none;
  z-index: 2;
}
.wf-tl { top: 0; left: 0; }
.wf-tr { top: 0; right: 0; }
.wf-bl { bottom: 0; left: 0; }
.wf-br { bottom: 0; right: 0; }
.wf-edge {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}
.wf-edge img {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
}
.wf-top { top: 0; left: 35px; right: 35px; height: 14px; }
.wf-bottom { bottom: 0; left: 35px; right: 35px; height: 14px; }
.wf-left { left: 0; top: 35px; bottom: 35px; width: 14px; }
.wf-right { right: 0; top: 35px; bottom: 35px; width: 14px; }
.wf-content {
  position: relative;
  z-index: 3;
}
</style>
