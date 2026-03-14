<template>
  <div>
    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <UInput v-model="search" placeholder="Rechercher..." icon="i-lucide-search" size="sm" class="w-full sm:w-auto" />
      <USelect v-model="filterType" :items="typeOptions" placeholder="Tous les types" size="sm" class="w-full sm:w-40" />
      <USelect v-model="filterDifficulty" :items="difficultyOptions" placeholder="Toutes difficultes" size="sm" class="w-full sm:w-40" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-default">
          <tr class="border-b border-default text-left text-muted">
            <th class="py-2 px-3">Nom</th>
            <th class="py-2 px-3">Type</th>
            <th class="py-2 px-3">Difficulte</th>
            <th class="py-2 px-3">Lien</th>
            <th v-if="!readonly" class="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="poi in filtered"
            :key="poi.id"
            class="border-b border-default hover:bg-elevated cursor-pointer"
            @click="emit('select', poi)"
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
            <td class="py-2 px-3" @click.stop>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`"
                target="_blank"
                class="text-primary hover:underline"
              >Google Maps</a>
            </td>
            <td v-if="!readonly" class="py-2 px-3 flex gap-1" @click.stop>
              <UButton size="xs" @click="emit('edit', poi)">Modifier</UButton>
              <UButton size="xs" color="error" variant="solid" @click="emit('delete', poi)">Supprimer</UButton>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="py-8 text-center text-dimmed">Aucun POI trouve</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PoiDefinition, PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

const props = defineProps<{
  pois: PoiDefinition[];
  poiTypes: PoiTypeRecord[];
  poiDifficulties: PoiDifficultyRecord[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  select: [poi: PoiDefinition];
  edit: [poi: PoiDefinition];
  delete: [poi: PoiDefinition];
}>();

const search = ref("");
const filterType = ref<string | undefined>(undefined);
const filterDifficulty = ref<string | undefined>(undefined);

const typeOptions = computed(() =>
  props.poiTypes.map((t) => ({ label: typeLabel(t.slug), value: t.slug }))
);

const difficultyOptions = computed(() =>
  props.poiDifficulties.map((d) => ({ label: difficultyLabel(d.slug), value: d.slug }))
);

const filtered = computed(() => {
  return props.pois.filter((poi) => {
    if (search.value && !poi.name.toLowerCase().includes(search.value.toLowerCase())) return false;
    if (filterType.value && poi.type !== filterType.value) return false;
    if (filterDifficulty.value && poi.difficulty !== filterDifficulty.value) return false;
    return true;
  });
});

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
