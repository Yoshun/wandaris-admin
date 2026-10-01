<template>
  <div class="wf" :style="{ padding: `${padding}px` }">
    <!-- Le cadre de la graphiste dès que ses 8 morceaux sont déposés, à 1 DP par pixel de l'art -->
    <FrameArt v-if="art" :pieces="pieces" fill="var(--panel-bg)" />
    <div v-else class="wf-outer">
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
import type { FramePieces } from "~/utils/frameArt";

/**
 * Portage CSS de `WoodenFrame` (mobile) : biseau extérieur 2 DP, surface plate 4 DP,
 * biseau intérieur inversé 2 DP — 8 DP de bordure, contenu inséré à `padding` (20 par
 * défaut, 8 pour la barre du bas). Le placeholder de l'app, en attendant l'art du cadre.
 *
 * Dès que les 8 morceaux du cadre sont déposés (catégorie « Cadre » de la page graphiste),
 * ils remplacent le biseau : la graphiste voit son cadre sur tous les écrans, à leur
 * taille réelle. Un cadre incomplet garde le biseau — un demi-cadre ne montrerait rien
 * d'utile ici, l'aperçu de la section Cadre est fait pour ça.
 */
withDefaults(defineProps<{ padding?: number }>(), { padding: 20 });

const pieces = inject(MOCK_FRAME_KEY, ref<FramePieces>({}));
const art = computed(() => isFrameComplete(pieces.value));
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
  border-color: var(--frame-bevel-light) var(--frame-bevel-dark) var(--frame-bevel-dark) var(--frame-bevel-light);
  pointer-events: none;
}
.wf-surface {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 4px solid var(--frame-surface);
}
.wf-inner {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid;
  border-color: var(--frame-bevel-dark) var(--frame-bevel-light) var(--frame-bevel-light) var(--frame-bevel-dark);
  background: var(--panel-bg);
}
.wf-content {
  position: relative;
  z-index: 3;
  flex: 1;
  min-height: 0;
}
</style>
