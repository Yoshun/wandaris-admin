<template>
  <MockPhone caption="Marchand">
    <MockOverlay title="Marchand" :close-src="icons.url('glyphs', 'close')" :height-pct="82" scroll>
      <div class="mc">
        <div class="mc-gold">
          <img v-if="gold" :src="gold" alt="" class="mc-gold-icon" />
          <span>1 250 or</span>
        </div>
        <MockTabs :items="['Acheter', 'Vendre']" value="Acheter" />
        <div class="mc-list">
          <MockPixelCard v-for="r in rows" :key="r.slug">
            <div class="mc-row">
              <img :src="r.src" alt="" class="mc-icon" />
              <div class="mc-info">
                <span class="mc-name">{{ r.label }}</span>
                <span class="mc-price">{{ r.price }} or / unité</span>
              </div>
              <MockButton label="Acheter" small />
            </div>
          </MockPixelCard>
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();
const gold = computed(() => props.icons.url("glyphs", "gold"));
const rows = computed(() =>
  props.icons
    .list("resources")
    .slice(0, 6)
    .map((r, i) => ({ slug: r.slug, label: r.label, src: props.icons.url("resources", r.slug)!, price: [4, 6, 5, 8, 3, 3][i] ?? 5 })),
);
</script>

<style scoped>
.mc {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.mc-gold {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 20px;
  color: var(--accent);
}
.mc-gold-icon { width: 20px; height: 20px; }
.mc-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-top: 4px;
}
.mc-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mc-icon { width: 28px; height: 28px; flex: none; }
.mc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.mc-name { font-size: 17px; color: var(--text); }
.mc-price { font-size: 14px; color: var(--accent); }
</style>
