<template>
  <div class="ib" :style="{ width: `${box}px`, height: `${box}px` }" :title="title">
    <div class="ib-art" :style="{ width: `${size}px`, height: `${size}px` }">
      <template v-if="src">
        <img :src="src" alt="" class="ib-shadow" />
        <img :src="src" alt="" class="ib-icon" />
      </template>
      <span
        v-else-if="glyph"
        class="ib-glyph"
        :style="{ fontSize: `${Math.round(size * 0.62)}px`, color: glyphColor ?? '#c8b898' }"
      >{{ glyph }}</span>
      <span v-else class="ib-missing">?</span>
      <span v-if="badge" class="ib-badge">{{ typeof badge === "number" ? badge : "" }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Portage de `IconButton` : icône sans cadre, l'art porte son contour ; une silhouette
 * noire décalée de 2 DP fait l'ombre portée. Sans icône déposée, un glyphe texte avec une
 * ombre dure tient la place (croix, +, −, recentrage). Zone de tap de 44 DP.
 */
withDefaults(
  defineProps<{ src: string | null; glyph?: string; glyphColor?: string; size?: number; box?: number; badge?: boolean | number; title?: string }>(),
  { glyph: "", glyphColor: undefined, size: 30, box: 44, badge: false, title: "" },
);
</script>

<style scoped>
.ib {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.ib-art {
  position: relative;
}
.ib-shadow,
.ib-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.ib-shadow {
  filter: brightness(0);
  opacity: 0.55;
  transform: translate(2px, 2px);
}
.ib-glyph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "VT323", monospace;
  font-weight: bold;
  line-height: 1;
  text-shadow: 2px 2px 0 #000;
}
.ib-missing {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #a08868;
  color: #a08868;
  font-family: "VT323", monospace;
  font-size: 20px;
}
.ib-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 12px;
  height: 12px;
  padding: 0 3px;
  background: #c4a882;
  border: 2px solid #000;
  color: #1a1410;
  font-family: "VT323", monospace;
  font-size: 11px;
  line-height: 8px;
  text-align: center;
}
</style>
