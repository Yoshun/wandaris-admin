<template>
  <MockPhone caption="Quêtes et titres">
    <MockOverlay title="Quêtes" :close-src="icons.url('glyphs', 'close')" :height-pct="84" scroll>
      <div class="qs">
        <MockTabs :items="['Quêtes', 'Titres']" value="Quêtes" />
        <span class="qs-section">En cours</span>
        <MockPixelCard v-for="q in QUESTS" :key="q.label" :highlighted="q.claimable">
          <span class="qs-title">{{ q.label }}</span>
          <MockBar :value="q.progress / q.target" :segments="q.target <= 12 ? q.target : 0" :label="q.target > 12 ? `${q.progress} / ${q.target}` : ''" />
          <div class="qs-meta">
            <span>{{ q.progress }}/{{ q.target }} · +{{ q.xp }} XP</span>
            <MockButton v-if="q.claimable" label="Réclamer" small />
          </div>
        </MockPixelCard>
        <span class="qs-section">Terminées</span>
        <MockPixelCard>
          <span class="qs-title">Premiers pas</span>
          <div class="qs-meta"><span>Visiter un lieu</span><span class="qs-done">Réclamé</span></div>
        </MockPixelCard>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();

const QUESTS = [
  { label: "Chasseur", progress: 10, target: 10, xp: 80, claimable: true },
  { label: "Cueilleur", progress: 3, target: 10, xp: 50, claimable: false },
  { label: "Grand voyageur", progress: 42, target: 100, xp: 200, claimable: false },
];
</script>

<style scoped>
.qs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.qs-section {
  font-size: 19px;
  color: var(--accent);
  margin-top: 4px;
}
.qs-title {
  font-size: 18px;
  color: var(--text);
  display: block;
  margin-bottom: 6px;
}
.qs-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 14px;
  color: var(--subtitle-text);
}
.qs-done { color: var(--success-text); }
</style>
