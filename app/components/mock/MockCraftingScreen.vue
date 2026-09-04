<template>
  <MockPhone caption="Artisanat">
    <MockOverlay title="Artisanat" :close-src="icons.url('glyphs', 'close')" :height-pct="86" scroll>
      <div class="cr">
        <MockTabs :items="['Bûcheron', 'Mineur', 'Forgeron', 'Couturier', 'Alchimiste']" value="Forgeron" />
        <div class="cr-prof">
          <span class="cr-level">Forgeron niv. 12</span>
          <MockBar :value="0.68" label="340 / 500 XP" :height="18" />
        </div>
        <div class="cr-cats">
          <MockButton label="Armes" small />
          <MockButton label="Armures" small variant="secondary" />
        </div>
        <MockPixelCard v-for="r in RECIPES" :key="r.name">
          <div class="cr-head">
            <span class="cr-name" :style="{ color: MOCK_UI.rarity[r.rarity] }">{{ r.name }}</span>
            <span class="cr-slot">{{ r.slot }}</span>
          </div>
          <span class="cr-stats">{{ r.stats }}</span>
          <div class="cr-ing">
            <span v-for="ing in r.ingredients" :key="ing.slug" class="cr-ing-item" :class="{ short: ing.short }">
              <img v-if="icons.url('resources', ing.slug)" :src="icons.url('resources', ing.slug)!" alt="" class="cr-ing-icon" />
              {{ ing.qty }} {{ ing.label }}
            </span>
          </div>
          <div class="cr-action">
            <MockStepper :minus="icons.url('map', 'zoom-out')" :plus="icons.url('map', 'zoom-in')" compact>
              <span class="cr-qty">1</span>
            </MockStepper>
            <MockButton label="Forger" small :disabled="r.ingredients.some((i) => i.short)" />
          </div>
        </MockPixelCard>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();

const RECIPES = [
  {
    name: "Épée de fer",
    slot: "Épée · Fer",
    rarity: "uncommon" as const,
    stats: "+8 force, +3 dextérité",
    ingredients: [{ slug: "ore", label: "Minerai", qty: 4, short: false }, { slug: "wood", label: "Bois", qty: 1, short: false }],
  },
  {
    name: "Hache d'acier",
    slot: "Hache · Acier",
    rarity: "rare" as const,
    stats: "+14 force, +6 endurance, +2 chance",
    ingredients: [{ slug: "ore", label: "Minerai", qty: 9, short: true }, { slug: "leather", label: "Cuir", qty: 2, short: false }],
  },
];
</script>

<style scoped>
.cr {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cr-prof {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cr-level { font-size: 16px; color: #c8b898; }
.cr-cats {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 2px 0;
}
.cr-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.cr-name { font-size: 18px; font-weight: bold; }
.cr-slot { font-size: 13px; color: #c8b898; }
.cr-stats { font-size: 14px; color: #6abf6a; display: block; margin-top: 2px; }
.cr-ing {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}
.cr-ing-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #c8b898;
}
.cr-ing-item.short { color: #cf6a6a; }
.cr-ing-icon { width: 16px; height: 16px; }
.cr-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.cr-qty { font-size: 18px; color: #c4a882; }
</style>
