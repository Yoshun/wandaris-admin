<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-default">
        <tr class="border-b border-default text-left text-muted">
          <th class="py-2 px-3">Nom</th>
          <th class="py-2 px-3">Type</th>
          <th class="py-2 px-3">Difficulte</th>
          <th class="py-2 px-3">Lien</th>
          <th v-if="!readonly" class="py-2 px-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="poi in pois"
          :key="poi.id"
          class="border-b border-default hover:bg-elevated"
        >
          <td class="py-2 px-3">{{ poi.name }}</td>
          <td class="py-2 px-3">
            <UBadge variant="subtle" color="neutral" size="sm">{{ typeLabel(poi.type) }}</UBadge>
          </td>
          <td class="py-2 px-3">
            <UBadge variant="subtle" :color="difficultyColor(poi.difficulty)" size="sm">
              {{ difficultyLabel(poi.difficulty) }}
            </UBadge>
          </td>
          <td class="py-2 px-3">
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`"
              target="_blank"
              class="text-primary hover:underline"
            >Google Maps</a>
          </td>
          <td v-if="!readonly" class="py-2 px-3">
            <div class="flex gap-1 justify-end">
              <UButton size="xs" icon="i-lucide-pencil" @click="emit('edit', poi)">Modifier</UButton>
              <UButton size="xs" color="error" variant="solid" icon="i-lucide-trash-2" @click="emit('delete', poi)">Supprimer</UButton>
            </div>
          </td>
        </tr>
        <tr v-if="pois.length === 0">
          <td :colspan="readonly ? 4 : 5" class="py-8 text-center text-dimmed">Aucun POI trouve</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PoiDefinition } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

defineProps<{
  pois: PoiDefinition[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  edit: [poi: PoiDefinition];
  delete: [poi: PoiDefinition];
}>();

function difficultyColor(difficulty: string) {
  switch (difficulty) {
    case "easy": return "success" as const;
    case "medium": return "warning" as const;
    case "hard": return "error" as const;
    case "very_hard": return "error" as const;
    default: return "neutral" as const;
  }
}
</script>
