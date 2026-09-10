<template>
  <MockPhone caption="Équipement">
    <MockOverlay title="Equipement" :close-src="icons.url('glyphs', 'close')" :height-pct="70">
      <div class="eq">
        <div class="eq-grid">
          <div class="eq-column">
            <div v-for="s in LEFT" :key="s.slug" class="eq-slot" :style="slotStyle(s)">
              <img v-if="icons.url('equipment', `slot-${s.slug}`)" :src="icons.url('equipment', `slot-${s.slug}`)!" alt="" class="eq-icon" />
              <span v-else class="eq-slot-label">{{ s.label }}</span>
            </div>
          </div>
          <div class="eq-center">
            <div class="eq-player">
              <img :src="'/mock/warrior.png'" alt="" class="eq-sprite" />
            </div>
          </div>
          <div class="eq-column">
            <div v-for="s in RIGHT" :key="s.slug" class="eq-slot" :style="slotStyle(s)">
              <img v-if="icons.url('equipment', `slot-${s.slug}`)" :src="icons.url('equipment', `slot-${s.slug}`)!" alt="" class="eq-icon" />
              <span v-else class="eq-slot-label">{{ s.label }}</span>
            </div>
          </div>
        </div>
        <div class="eq-bottom">
          <div class="eq-slot" :style="slotStyle(WEAPON)">
            <img v-if="icons.url('equipment', 'slot-weapon')" :src="icons.url('equipment', 'slot-weapon')!" alt="" class="eq-icon" />
            <span v-else class="eq-slot-label">Arme</span>
          </div>
        </div>
        <div class="eq-detail">
          <span class="eq-detail-name" :style="{ color: MOCK_UI.rarity.epic }">Épée d'acier du crépuscule</span>
          <span class="eq-detail-stat">+14 force · +6 dextérité</span>
          <span class="eq-detail-affix">Critique 5%</span>
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();

interface Slot { slug: string; label: string; rarity?: keyof typeof MOCK_UI.rarity }
const LEFT: Slot[] = [{ slug: "head", label: "Tête", rarity: "uncommon" }, { slug: "torso", label: "Torse", rarity: "rare" }, { slug: "legs", label: "Jambes", rarity: "common" }];
const RIGHT: Slot[] = [{ slug: "hands", label: "Mains", rarity: "common" }, { slug: "feet", label: "Pieds", rarity: "uncommon" }, { slug: "back", label: "Cape", rarity: "rare" }];
const WEAPON: Slot = { slug: "weapon", label: "Arme", rarity: "epic" };

function slotStyle(s: Slot) {
  return { borderColor: s.rarity ? MOCK_UI.rarity[s.rarity] : "var(--close-btn-bg)" };
}
</script>

<style scoped>
.eq {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.eq-grid {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.eq-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.eq-slot {
  width: 54px;
  height: 54px;
  border: 2px solid var(--close-btn-bg);
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.eq-icon { width: 34px; height: 34px; }
.eq-slot-label { font-size: 13px; color: var(--text); }
.eq-center { flex: 1; display: flex; justify-content: center; }
.eq-player {
  width: 80px;
  height: 110px;
  border: 1px dashed var(--close-btn-bg);
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.eq-sprite { width: 60px; height: 60px; }
.eq-bottom { margin-top: 4px; }
.eq-detail {
  width: 100%;
  border-top: 1px solid var(--close-btn-bg);
  margin-top: 8px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}
.eq-detail-name { font-size: 18px; font-weight: bold; }
.eq-detail-stat { font-size: 15px; color: var(--stat-text); }
.eq-detail-affix { font-size: 15px; color: var(--affix-text); }
</style>
