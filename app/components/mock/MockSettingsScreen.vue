<template>
  <MockPhone caption="Paramètres">
    <MockOverlay title="Paramètres" :close-src="icons.url('glyphs', 'close')">
      <div class="se">
        <span class="se-label">Thème</span>
        <MockTabs :items="['Clair', 'Sombre']" value="Sombre" :baseline="false" />
        <span class="se-label">Combat</span>
        <MockCheck label="Fermer automatiquement après le combat" :checked="true" />
        <span class="se-label">Mode GPS</span>
        <MockTabs :items="['Normal', 'Économie']" value="Normal" :baseline="false" />
        <span class="se-label">Notifications</span>
        <MockCheck label="Lieux à proximité" :checked="true" />
        <MockCheck label="Monstres à proximité" :checked="false" />
        <div class="se-actions">
          <MockButton label="Se déconnecter" variant="secondary" full-width />
          <MockButton label="Réinitialiser la progression" variant="danger" full-width />
        </div>
      </div>
    </MockOverlay>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

defineProps<{ icons: MockIcons }>();
</script>

<style scoped>
.se {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.se-label {
  font-size: 17px;
  color: #c4a882;
  margin-top: 8px;
}
.se-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
</style>
