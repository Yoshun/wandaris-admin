<template>
  <MockPhone caption="Profil">
    <MockOverlay title="Yoshun" :close-src="icons.url('glyphs', 'close')">
      <div class="pf">
        <div v-for="row in ROWS" :key="row.label" class="pf-row">
          <span class="pf-label">{{ row.label }}</span>
          <span class="pf-value">
            {{ row.value }}
            <img v-if="row.gold && gold" :src="gold" alt="" class="pf-gold" />
          </span>
        </div>
        <div class="pf-divider" />
        <span class="pf-section">Statistiques</span>
        <div v-for="s in STATS" :key="s.label" class="pf-row">
          <span class="pf-label">{{ s.label }}</span>
          <span class="pf-value">{{ s.value }}</span>
        </div>
        <div class="pf-row">
          <span class="pf-label pf-accent">Points à répartir</span>
          <span class="pf-value pf-accent">1</span>
        </div>
        <div class="pf-cta">
          <MockButton label="Répartir les points" full-width />
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();
const gold = computed(() => props.icons.url("glyphs", "gold"));

const ROWS = [
  { label: "Niveau", value: "12" },
  { label: "Expérience", value: "340 / 500" },
  { label: "Or", value: "1 250", gold: true },
  { label: "Lieux découverts", value: "18" },
  { label: "Distance parcourue", value: "42,3 km" },
  { label: "Aventurier depuis", value: "12 mars 2026" },
];
const STATS = [
  { label: "Force", value: "8" },
  { label: "Dextérité", value: "5" },
  { label: "Endurance", value: "7" },
  { label: "Charisme", value: "3" },
  { label: "Chance", value: "2" },
];
</script>

<style scoped>
.pf {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.pf-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
.pf-label { font-size: 17px; color: var(--text); }
.pf-value {
  font-size: 18px;
  color: var(--text-strong);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.pf-gold { width: 18px; height: 18px; }
.pf-accent { color: var(--accent); font-weight: bold; }
.pf-divider {
  height: 1px;
  background: var(--frame-bevel-dark);
  margin: 10px 0;
}
.pf-section {
  font-size: 19px;
  color: var(--accent);
  text-align: center;
  margin-bottom: 6px;
}
.pf-cta { margin-top: 12px; }
</style>
