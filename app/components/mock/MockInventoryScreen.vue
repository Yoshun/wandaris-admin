<template>
  <MockPhone caption="Inventaire">
    <MockOverlay title="Inventaire" :close-src="icons.url('glyphs', 'close')">
      <div class="inv">
        <span class="inv-section">Ressources</span>
        <div v-for="r in resources" :key="r.slug" class="inv-row">
          <img :src="r.src" alt="" class="inv-icon" />
          <span class="inv-label">{{ r.qty }}x {{ r.label }}</span>
        </div>
        <div class="inv-divider" />
        <span class="inv-section">Potions</span>
        <div class="inv-row">
          <img v-if="potion" :src="potion" alt="" class="inv-icon" />
          <span class="inv-label">3x Potion de soin</span>
        </div>
        <div class="inv-row">
          <img v-if="buff" :src="buff" alt="" class="inv-icon" />
          <span class="inv-label">1x Élixir de force</span>
        </div>
        <div class="inv-buff">
          <span class="inv-effect">+10% force (30min)</span>
          <MockButton label="Utiliser" small />
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();

const resources = computed(() =>
  props.icons
    .list("resources")
    .slice(0, 5)
    .map((r, i) => ({ slug: r.slug, label: r.label, src: props.icons.url("resources", r.slug)!, qty: [12, 8, 5, 3, 21, 2, 7][i] ?? 1 })),
);
const potion = computed(() => props.icons.url("consumables", "potion"));
const buff = computed(() => props.icons.url("consumables", "buff"));
</script>

<style scoped>
.inv {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.inv-section {
  font-size: 19px;
  color: #c4a882;
  margin-bottom: 8px;
}
.inv-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
.inv-icon { width: 20px; height: 20px; }
.inv-label { font-size: 18px; color: #c8b898; }
.inv-divider {
  height: 1px;
  background: #352818;
  margin: 10px 0;
}
.inv-buff {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-left: 28px;
}
.inv-effect { font-size: 14px; color: #6abf6a; }
</style>
