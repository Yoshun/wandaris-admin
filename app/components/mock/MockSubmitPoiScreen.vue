<template>
  <MockPhone caption="Proposer un lieu">
    <MockOverlay title="Proposer un lieu" :close-src="icons.url('glyphs', 'close')">
      <div class="sp">
        <MockInput placeholder="Nom du lieu" value="Lavoir de la Combe" />
        <MockInput placeholder="Description (optionnel)" multi />
        <span class="sp-label">Photos (1/3)</span>
        <div class="sp-thumbs">
          <div class="sp-thumb"><span class="sp-thumb-x">X</span></div>
        </div>
        <div class="sp-photo-btns">
          <div class="sp-half"><MockButton label="Depuis la galerie" variant="secondary" small full-width /></div>
          <div class="sp-half"><MockButton label="Prendre une photo" variant="secondary" small full-width /></div>
        </div>
        <div class="sp-submit"><MockButton label="Soumettre" full-width /></div>
        <MockButton label="Voir mon historique" variant="secondary" small full-width />
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();
</script>

<style scoped>
.sp {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sp-label { font-size: 14px; color: var(--text); }
.sp-thumbs { display: flex; gap: 8px; }
.sp-thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border: 2px solid var(--frame-bevel-dark);
  background: linear-gradient(135deg, #5c7064, #2d3c47);
}
.sp-thumb-x {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: var(--danger-bg);
  border: 2px solid var(--frame-bevel-dark);
  color: var(--contrast-text);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sp-photo-btns { display: flex; gap: 6px; }
.sp-half { flex: 1; min-width: 0; }
.sp-submit { margin-top: 6px; }
</style>
