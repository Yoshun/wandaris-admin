<template>
  <MockPhone caption="Combat">
    <MockOverlay :close-src="icons.url('glyphs', 'close')">
      <div class="cb-row">
        <div class="cb-col">
          <img :src="'/mock/warrior.png'" alt="" class="cb-sprite" />
          <span class="cb-name">Yoshun niv.12</span>
          <div class="cb-gauge">
            <div class="cb-fill cb-fill-me" />
            <span class="cb-chev cb-chev-r">›</span>
          </div>
          <div class="cb-hp"><div class="cb-hp-fill" :style="{ width: '42%', background: MOCK_UI.hpPlayer }" /></div>
          <span class="cb-hp-text">50/120</span>
        </div>
        <span class="cb-vs">VS</span>
        <div class="cb-col">
          <img v-if="monster" :src="monster.src" alt="" class="cb-sprite cb-telegraph" />
          <span v-else class="cb-sprite cb-missing">?</span>
          <span class="cb-name">{{ monster?.label ?? "Monstre" }} niv.8</span>
          <div class="cb-gauge">
            <div class="cb-fill cb-fill-mob" />
            <span class="cb-chev cb-chev-l">‹</span>
          </div>
          <div class="cb-hp"><div class="cb-hp-fill" :style="{ width: '58%', background: MOCK_UI.hpMonster }" /></div>
          <span class="cb-hp-text">35/60</span>
        </div>
      </div>

      <!-- Ceinture : cinq crans fixes, un par palier, pleine largeur -->
      <div class="cb-belt">
        <div v-for="t in tiers" :key="t.slug" class="cb-slot" :class="{ empty: t.owned === 0, reco: t.reco }">
          <img :src="t.src" alt="" />
          <span v-if="t.owned" class="cb-badge">{{ t.owned }}</span>
          <span class="cb-heal">+{{ t.heal }}</span>
        </div>
      </div>

      <div class="cb-status">
        <template v-if="won">
          <span class="cb-phase">Victoire !</span>
          <div class="cb-loot">
            <span class="cb-plaque">+14 xp</span>
            <span class="cb-plaque">+22 or</span>
            <span v-if="lootIcon" class="cb-plaque">+2 <img :src="lootIcon" alt="" /></span>
          </div>
        </template>
        <span v-else class="cb-hint">Tapez l'écran pour frapper plus vite</span>
      </div>
    </MockOverlay>
    <template #toolbar>
      <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-dices" @click="reroll">Autre monstre</UButton>
      <UButton size="sm" variant="outline" color="neutral" :icon="won ? 'i-lucide-swords' : 'i-lucide-trophy'" @click="won = !won">
        {{ won ? "En combat" : "Victoire" }}
      </UButton>
    </template>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

/**
 * L'écran de combat tel qu'il est dans l'app : colonne = personnage, chaque jauge se
 * remplit vers l'adversaire (celle du mob vire au rouge et son sprite tremble dans le
 * dernier quart), ceinture de potions à cinq crans, « VS » en lettres entre les deux.
 */
const props = defineProps<{ icons: MockIcons }>();

const won = ref(false);

const monster = ref<{ src: string; label: string } | null>(null);
function reroll() {
  const item = props.icons.pick("monsters", monster.value ? [monster.value.label] : []);
  monster.value = item ? { src: props.icons.url("monsters", item.slug)!, label: item.label } : null;
}
reroll();

// Les paliers, avec leur icône propre dès qu'elle est déposée, sinon la potion de base.
const TIERS = [
  { slug: "potion-minor", heal: 50, owned: 3 },
  { slug: "potion", heal: 120, owned: 1 },
  { slug: "potion-major", heal: 250, owned: 0 },
  { slug: "potion-supreme", heal: 500, owned: 2 },
  { slug: "elixir", heal: 1000, owned: 0 },
];
const tiers = computed(() => {
  const missing = 70; // 120 - 50 PV : le recommandé est le plus petit soin qui couvre
  const owned = TIERS.filter((t) => t.owned > 0);
  const reco = owned.find((t) => t.heal >= missing) ?? owned[owned.length - 1];
  return TIERS.map((t) => ({
    ...t,
    src: props.icons.url("consumables", t.slug) ?? props.icons.url("consumables", "potion") ?? "",
    reco: t === reco,
  }));
});

const lootIcon = computed(() => {
  const r = props.icons.list("resources")[0];
  return r ? props.icons.url("resources", r.slug) : null;
});
</script>

<style scoped>
.cb-row {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 6px;
}
.cb-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.cb-vs { flex: none; width: 46px; text-align: center; font-size: 22px; font-weight: bold; color: #c4a882; margin-top: 30px; }
.cb-sprite { width: 40px; height: 40px; }
.cb-missing {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #a08868;
  color: #a08868;
}
.cb-name {
  font-size: 15px;
  color: #c8b898;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.cb-gauge {
  position: relative;
  width: 100%;
  height: 5px;
  background: #2a2218;
  margin-top: 14px;
}
.cb-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #c4a882;
}
.cb-fill-me { left: 0; animation: fill 2.2s linear infinite; }
.cb-fill-mob { right: 0; animation: filldanger 3s linear infinite; }
@keyframes fill { from { width: 0; } to { width: 100%; } }
@keyframes filldanger {
  0% { width: 0; background: #c4a882; }
  74% { background: #c4a882; }
  75% { background: #e74c3c; }
  100% { width: 100%; background: #e74c3c; }
}
.cb-chev {
  position: absolute;
  top: -9px;
  font-size: 16px;
  line-height: 1;
  color: #c4a882;
}
.cb-chev-r { right: -8px; }
.cb-chev-l { left: -8px; }
/* Télégraphe : sauts entiers de ±2 px dans le dernier quart, jamais d'interpolation */
.cb-telegraph { animation: windup 3s steps(1, end) infinite; }
@keyframes windup {
  0%, 74% { transform: none; }
  76% { transform: translateX(2px); }
  80% { transform: translateX(-2px); }
  84% { transform: translateX(2px); }
  88% { transform: translateX(-2px); }
  92% { transform: translateX(2px); }
  96% { transform: translateX(-2px); }
  100% { transform: none; }
}
.cb-hp {
  width: 100%;
  height: 14px;
  background: #2a2218;
  overflow: hidden;
}
.cb-hp-fill { height: 100%; }
.cb-hp-text { font-size: 12px; color: #aaaaaa; }

.cb-belt {
  width: 100%;
  height: 48px;
  display: flex;
  gap: 4px;
  margin-top: 16px;
}
.cb-slot {
  position: relative;
  flex: 1;
  height: 48px;
  border: 2px solid #2a2218;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}
.cb-slot img { width: 22px; height: 22px; }
.cb-slot .cb-heal { font-size: 12px; line-height: 12px; color: #c8b898; }
.cb-slot.empty { opacity: 0.35; }
.cb-slot.reco { border-color: #c4a882; background: rgba(196, 168, 130, 0.1); }
.cb-slot.reco .cb-heal { color: #c4a882; }
.cb-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: #c4a882;
  border: 2px solid #000;
  color: #1a1410;
  font-size: 11px;
  line-height: 12px;
  text-align: center;
}

.cb-status {
  height: 50px;
  width: 100%;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.cb-hint { font-size: 16px; color: #c4a882; font-weight: bold; }
.cb-phase { font-size: 26px; line-height: 26px; color: #2ecc71; font-weight: bold; }
.cb-loot { display: flex; gap: 8px; }
.cb-plaque {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #46341f;
  border: 2px solid #1e140c;
  color: #c8b898;
  font-size: 17px;
  line-height: 17px;
  font-weight: bold;
}
.cb-plaque img { width: 18px; height: 18px; }
</style>
