<template>
  <div class="space-y-4">
    <p class="text-muted text-sm max-w-3xl">
      Les écrans de l'app tels qu'ils se présentent avec les icônes du dépôt : ce que vous déposez apparaît ici
      immédiatement, en contexte et à taille réelle. La carte est la vraie carte du jeu (zoom par les boutons,
      déplacement à la souris). <strong>Simuler un spawn</strong> sème des lieux, ressources, monstres et une porte de donjon.
    </p>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div v-for="screen in SCREENS" :key="screen" class="h-[calc(100vh-6.5rem)] min-h-[520px]">
        <component :is="screen" :icons="icons" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconsResponse } from "~~/types/poi";
import {
  MockAuthScreen, MockMapScreen, MockCombatScreen, MockInventoryScreen, MockEquipmentScreen,
  MockCraftingScreen, MockMerchantScreen, MockProfileScreen, MockStatsScreen, MockQuestsScreen,
  MockRouteScreen, MockSubmitPoiScreen, MockSettingsScreen,
} from "#components";

const props = defineProps<{ data: IconsResponse; apiBase: string }>();
const icons = computed(() => buildMockIcons(props.data, props.apiBase));

/** Ordre de visite : la porte d'entrée, le jeu, puis les fenêtres dans l'ordre de la barre du bas. */
const SCREENS = [
  MockAuthScreen, MockMapScreen, MockCombatScreen, MockInventoryScreen, MockEquipmentScreen,
  MockCraftingScreen, MockMerchantScreen, MockProfileScreen, MockStatsScreen, MockQuestsScreen,
  MockRouteScreen, MockSubmitPoiScreen, MockSettingsScreen,
];
</script>
