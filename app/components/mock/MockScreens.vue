<template>
  <div class="space-y-4">
    <!-- Le thème vaut pour toutes les maquettes : l'app se joue dans l'un ou l'autre, jamais mélangés -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted">Thème</span>
      <UButton
        v-for="t in THEMES"
        :key="t.id"
        size="xs"
        :variant="theme === t.id ? 'solid' : 'outline'"
        :color="theme === t.id ? 'primary' : 'neutral'"
        :icon="t.icon"
        @click="setTheme(t.id)"
      >
        {{ t.label }}
      </UButton>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div v-for="s in SCREENS" :key="s.id" class="h-[calc(100vh-9rem)] min-h-[520px]">
        <!-- La carte MapLibre est remontée au changement de thème : son style se charge une fois -->
        <component :is="s.comp" :key="s.id === 'map' ? `map-${theme}` : s.id" :icons="icons" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconsResponse } from "~~/types/poi";
import type { MockTheme } from "~/utils/mockIcons";
import {
  MockAuthScreen, MockMapScreen, MockCombatScreen, MockInventoryScreen, MockEquipmentScreen,
  MockCraftingScreen, MockMerchantScreen, MockProfileScreen, MockStatsScreen, MockQuestsScreen,
  MockRouteScreen, MockSubmitPoiScreen, MockSettingsScreen,
} from "#components";

const props = defineProps<{ data: IconsResponse; apiBase: string }>();
const icons = computed(() => buildMockIcons(props.data, props.apiBase));

const THEMES = [
  { id: "light", label: "Clair", icon: "i-lucide-sun" },
  { id: "dark", label: "Sombre", icon: "i-lucide-moon" },
] as const;

/** Clair par défaut : c'est le thème par défaut de l'app. */
const theme = ref<MockTheme>("light");
provide(MOCK_THEME_KEY, theme);
function setTheme(t: MockTheme) {
  theme.value = t;
}

/** Ordre de visite : la porte d'entrée, le jeu, puis les fenêtres dans l'ordre de la barre du bas. */
const SCREENS = [
  { id: "auth", comp: MockAuthScreen },
  { id: "map", comp: MockMapScreen },
  { id: "combat", comp: MockCombatScreen },
  { id: "inventory", comp: MockInventoryScreen },
  { id: "equipment", comp: MockEquipmentScreen },
  { id: "crafting", comp: MockCraftingScreen },
  { id: "merchant", comp: MockMerchantScreen },
  { id: "profile", comp: MockProfileScreen },
  { id: "stats", comp: MockStatsScreen },
  { id: "quests", comp: MockQuestsScreen },
  { id: "route", comp: MockRouteScreen },
  { id: "submit", comp: MockSubmitPoiScreen },
  { id: "settings", comp: MockSettingsScreen },
];
</script>
