<template>
  <div class="ov-screen">
    <div class="ov-dim" />
    <div class="ov-center">
      <MockFrame :padding="28" :style="{ width: `${widthPct}%`, height: heightPct ? `${heightPct}%` : undefined }">
        <div class="ov-panel">
          <template v-if="title">
            <div class="ov-band">
              <span class="ov-title">{{ title }}</span>
              <div class="ov-close"><MockIconButton :src="closeSrc" :size="30" title="Fermer" /></div>
            </div>
            <div class="ov-rule" />
          </template>
          <slot />
        </div>
      </MockFrame>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Fond d'écran assombri + cadre bois + bande de titre (`OverlayHeader`) : le squelette de
 * toutes les fenêtres de l'app. Le fond reproduit la teinte de la carte sous le voile.
 */
withDefaults(defineProps<{ title?: string; closeSrc: string | null; widthPct?: number; heightPct?: number }>(), {
  title: "",
  widthPct: 92,
  heightPct: 0,
});
</script>

<style scoped>
.ov-screen {
  position: absolute;
  inset: 0;
  background-color: #1e1a14;
  background-image:
    linear-gradient(#252018 1px, transparent 1px),
    linear-gradient(90deg, #252018 1px, transparent 1px);
  background-size: 48px 48px;
}
.ov-dim {
  position: absolute;
  inset: 0;
  background: rgba(14, 10, 6, 0.7);
}
.ov-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ov-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.ov-band {
  position: relative;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ov-title {
  font-size: 22px;
  font-weight: bold;
  color: #c4a882;
  line-height: 22px;
  padding: 0 40px;
  white-space: nowrap;
}
.ov-close {
  position: absolute;
  right: -10px;
  top: 0;
}
.ov-rule {
  width: 100%;
  height: 2px;
  background: #352818;
  margin-bottom: 10px;
}
</style>
