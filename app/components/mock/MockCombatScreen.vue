<template>
  <MockPhone caption="Combat">
    <MockOverlay :close-src="icons.url('glyphs', 'close')">
      <div class="cb-row">
        <div class="cb-col">
          <img :src="'/mock/knight.png'" alt="" class="cb-sprite" />
          <span class="cb-name">Yoshun niv.12</span>
          <div class="cb-timer"><div class="cb-timer-fill" style="width: 72%" /></div>
          <div class="cb-hp"><div class="cb-hp-fill" :style="{ width: '100%', background: MOCK_UI.hpPlayer }" /></div>
          <span class="cb-hp-text">120/120</span>
        </div>
        <span class="cb-vs">VS</span>
        <div class="cb-col">
          <img v-if="monster" :src="monster.src" alt="" class="cb-sprite" />
          <span v-else class="cb-sprite cb-missing">?</span>
          <span class="cb-name">{{ monster?.label ?? "Monstre" }} niv.8</span>
          <div class="cb-timer"><div class="cb-timer-fill" style="width: 35%" /></div>
          <div class="cb-hp"><div class="cb-hp-fill" :style="{ width: '58%', background: MOCK_UI.hpMonster }" /></div>
          <span class="cb-hp-text">35/60</span>
        </div>
      </div>
      <div class="cb-heal">
        <MockButton :icon="icons.url('consumables', 'potion')" label="+50 (3)" small />
        <MockButton :icon="icons.url('consumables', 'potion')" label="+120 (1)" small />
      </div>
    </MockOverlay>
    <template #toolbar>
      <UButton size="sm" variant="outline" color="neutral" icon="i-lucide-dices" @click="reroll">Autre monstre</UButton>
    </template>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();

const monster = ref<{ src: string; label: string } | null>(null);
function reroll() {
  const item = props.icons.pick("monsters", monster.value ? [monster.value.label] : []);
  monster.value = item ? { src: props.icons.url("monsters", item.slug)!, label: item.label } : null;
}
reroll();
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
.cb-timer {
  width: 100%;
  height: 6px;
  background: #2a2218;
  margin-top: 14px;
}
.cb-timer-fill { height: 100%; background: #c4a882; }
.cb-hp {
  width: 100%;
  height: 14px;
  background: #2a2218;
  overflow: hidden;
}
.cb-hp-fill { height: 100%; }
.cb-hp-text { font-size: 14px; color: #aaaaaa; }
.cb-vs {
  font-size: 20px;
  font-weight: bold;
  color: #c4a882;
  padding-top: 12px;
}
.cb-heal {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 18px;
}
</style>
