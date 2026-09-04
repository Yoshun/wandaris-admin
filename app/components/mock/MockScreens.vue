<template>
  <div class="space-y-4">
    <p class="text-muted text-sm max-w-3xl">
      Les écrans de l'app tels qu'ils se présentent avec les icônes du dépôt : ce que vous déposez apparaît ici
      immédiatement, en contexte et à taille réelle. La carte est la vraie carte du jeu (zoom par les boutons,
      déplacement à la souris). <strong>Simuler un spawn</strong> sème des lieux, ressources, monstres et une porte de donjon.
    </p>
    <div class="flex gap-10 overflow-x-auto pb-6 pt-2 px-2 snap-x">
      <div class="snap-start"><MockMapScreen :icons="icons" /></div>
      <div class="snap-start"><MockCombatScreen :icons="icons" /></div>
      <div class="snap-start"><MockInventoryScreen :icons="icons" /></div>
      <div class="snap-start"><MockEquipmentScreen :icons="icons" /></div>
      <div class="snap-start"><MockAuthScreen :icons="icons" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconsResponse } from "~~/types/poi";

const props = defineProps<{ data: IconsResponse; apiBase: string }>();
const icons = computed(() => buildMockIcons(props.data, props.apiBase));
</script>
