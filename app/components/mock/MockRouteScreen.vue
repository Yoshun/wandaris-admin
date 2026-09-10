<template>
  <MockPhone caption="Explorer — parcours">
    <MockOverlay title="Explorer" :close-src="icons.url('glyphs', 'close')" :height-pct="86" scroll>
      <div class="rt">
        <span class="rt-label">Rayon : 2 km</span>
        <MockStepper :minus="icons.url('map', 'zoom-out')" :plus="icons.url('map', 'zoom-in')">
          <MockBar :value="3 / 8" :segments="8" />
        </MockStepper>
        <MockCheck label="Retour au point de départ" :checked="true" />
        <MockButton label="Calculer le parcours" full-width />
        <div class="rt-summary">
          <div class="rt-sum"><span class="rt-sum-value">5</span><span class="rt-sum-label">lieux</span></div>
          <div class="rt-sum"><span class="rt-sum-value">6,2 km</span><span class="rt-sum-label">distance</span></div>
          <div class="rt-sum"><span class="rt-sum-value">1h25</span><span class="rt-sum-label">durée</span></div>
        </div>
        <div v-for="(p, i) in stops" :key="p.name" class="rt-row">
          <span class="rt-index">{{ i + 1 }}</span>
          <div class="rt-info">
            <span class="rt-name">{{ p.name }}</span>
            <span class="rt-detail">{{ p.detail }}</span>
          </div>
          <img v-if="p.src" :src="p.src" alt="" class="rt-icon" />
        </div>
        <div class="rt-row">
          <span class="rt-index rt-back">↩</span>
          <div class="rt-info">
            <span class="rt-name">Retour au départ</span>
            <span class="rt-detail">6,2 km · 1h25</span>
          </div>
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();

const NAMES: Record<string, string> = {
  castle: "Château de Montrottier",
  church: "Église Saint-Nizier",
  ruin: "Ruines du prieuré",
  tower: "Tour de la Belle-Allemande",
  viewpoint: "Belvédère des Roches",
  bridge: "Pont de l'Île Barbe",
  lake: "Lac de la Tête d'Or",
  mill: "Moulin de Rochetaillée",
};
const stops = computed(() => {
  const pool = props.icons.list("pois").filter((p) => p.slug !== "dungeon" && p.slug !== "unknown");
  const picked = pool.slice(0, 4);
  const details = ["1,2 km · 18 min", "2,4 km · 35 min", "3,9 km · 55 min", "5,1 km · 1h12"];
  return picked.map((p, i) => ({ name: NAMES[p.slug] ?? p.label, detail: details[i], src: props.icons.url("pois", p.slug) }));
});
</script>

<style scoped>
.rt {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rt-label { font-size: 17px; color: var(--text); }
.rt-summary {
  display: flex;
  justify-content: space-around;
  padding: 6px 0;
  border-top: 1px solid var(--frame-bevel-dark);
  border-bottom: 1px solid var(--frame-bevel-dark);
}
.rt-sum { display: flex; flex-direction: column; align-items: center; }
.rt-sum-value { font-size: 22px; color: var(--accent); }
.rt-sum-label { font-size: 13px; color: var(--subtitle-text); }
.rt-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid var(--input-border);
}
.rt-index {
  width: 26px;
  height: 26px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  border: 2px solid var(--bar-border);
  color: var(--accent-text);
  font-size: 16px;
}
.rt-back { background: var(--subtitle-text); font-size: 14px; }
.rt-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rt-name { font-size: 16px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rt-detail { font-size: 13px; color: var(--subtitle-text); }
.rt-icon { width: 24px; height: 24px; flex: none; }
</style>
