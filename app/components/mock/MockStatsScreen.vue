<template>
  <MockPhone caption="Répartition des points">
    <MockOverlay title="Répartir" :close-src="icons.url('glyphs', 'close')">
      <div class="sa">
        <div v-for="s in STATS" :key="s.label" class="sa-row">
          <div class="sa-info">
            <span class="sa-name">{{ s.label }}</span>
            <span class="sa-desc">{{ s.desc }}</span>
          </div>
          <MockStepper :minus="icons.url('map', 'zoom-out')" :plus="icons.url('map', 'zoom-in')" compact>
            <span class="sa-value">{{ s.value }}<span v-if="s.added" class="sa-added"> +{{ s.added }}</span></span>
          </MockStepper>
        </div>
        <div class="sa-remaining">Points restants : <b>0</b></div>
        <MockButton label="Valider" full-width />
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();

const STATS = [
  { label: "Force", desc: "+5% attaque / point", value: 8, added: 1 },
  { label: "Dextérité", desc: "+5% vitesse / point", value: 5, added: 0 },
  { label: "Endurance", desc: "+PV max", value: 7, added: 0 },
  { label: "Charisme", desc: "+5% or / point", value: 3, added: 0 },
  { label: "Chance", desc: "+2% butin / point", value: 2, added: 0 },
];
</script>

<style scoped>
.sa {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
}
.sa-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sa-name { font-size: 18px; color: var(--text); }
.sa-desc { font-size: 13px; color: var(--subtitle-text); }
.sa-value { font-size: 20px; color: var(--text-strong); }
.sa-added { color: var(--stat-text); font-size: 16px; }
.sa-remaining {
  text-align: center;
  font-size: 16px;
  color: var(--text);
  margin: 8px 0 4px;
}
.sa-remaining b { color: var(--accent); }
</style>
