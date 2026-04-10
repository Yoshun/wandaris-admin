<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="POI valides" icon="i-lucide-map-pin">
        <template #right>
          <UButton
            v-if="can('pois.manage')"
            icon="i-lucide-plus"
            @click="navigateTo('/pois/new')"
          >
            Nouveau POI
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-4">
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 items-center">
          <UInput
            v-model="searchInput"
            placeholder="Rechercher par nom..."
            icon="i-lucide-search"
            size="sm"
            class="w-full sm:w-64"
          />
          <USelect
            v-model="filterType"
            :items="typeOptions"
            placeholder="Tous les types"
            size="sm"
            class="w-full sm:w-48"
          />
          <USelect
            v-model="filterDifficulty"
            :items="difficultyOptions"
            placeholder="Toutes difficultes"
            size="sm"
            class="w-full sm:w-48"
          />
          <UButton
            v-if="hasActiveFilter"
            variant="soft"
            color="neutral"
            size="sm"
            icon="i-lucide-x"
            @click="clearFilters"
          >
            Effacer
          </UButton>
          <span class="text-sm text-dimmed ml-auto">
            {{ total }} POI{{ total > 1 ? "s" : "" }}<span v-if="hasActiveFilter"> (filtre)</span>
          </span>
        </div>

        <!-- Table -->
        <div v-if="loading" class="space-y-3">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>
        <div v-else-if="fetchError" class="text-error p-4">{{ fetchError }}</div>
        <PoiList
          v-else
          :pois="pois"
          :readonly="!can('pois.manage')"
          @edit="onEdit"
          @delete="onDeleteRequest"
        />

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center pt-2">
          <UPagination
            v-model:page="page"
            :total="total"
            :items-per-page="pageSize"
            :sibling-count="1"
            show-edges
          />
        </div>
      </div>

      <ConfirmDialog
        :visible="!!poiToDelete"
        :message="`Supprimer le POI \u00AB ${poiToDelete?.name} \u00BB ?`"
        @confirm="confirmDelete"
        @cancel="poiToDelete = null"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PoiDefinition, PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

const { can } = useAuth();
const { listPois, deletePoi, listPoiTypes, listPoiDifficulties } = useApi();

const pois = ref<PoiDefinition[]>([]);
const total = ref(0);
const poiTypesData = ref<PoiTypeRecord[]>([]);
const poiDifficultiesData = ref<PoiDifficultyRecord[]>([]);
const loading = ref(true);
const fetchError = ref("");
const poiToDelete = ref<PoiDefinition | null>(null);

// Pagination
const pageSize = 50;
const page = ref(1);

// Filters
const searchInput = ref("");
const search = ref("");
const filterType = ref<string | undefined>(undefined);
const filterDifficulty = ref<string | undefined>(undefined);

// Debounce search input → search
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search.value = val.trim();
  }, 300);
});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

const hasActiveFilter = computed(
  () => !!search.value || !!filterType.value || !!filterDifficulty.value
);

const typeOptions = computed(() =>
  poiTypesData.value.map((t) => ({ label: typeLabel(t.slug), value: t.slug }))
);
const difficultyOptions = computed(() =>
  poiDifficultiesData.value.map((d) => ({ label: difficultyLabel(d.slug), value: d.slug }))
);

async function fetchPois() {
  loading.value = true;
  fetchError.value = "";
  try {
    const res = await listPois({
      limit: pageSize,
      offset: (page.value - 1) * pageSize,
      search: search.value || undefined,
      type: filterType.value || undefined,
      difficulty: filterDifficulty.value || undefined,
    });
    pois.value = res.pois;
    total.value = res.total;
  } catch (e: any) {
    fetchError.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function fetchMeta() {
  try {
    const [t, d] = await Promise.all([listPoiTypes(), listPoiDifficulties()]);
    poiTypesData.value = t;
    poiDifficultiesData.value = d;
  } catch (e: any) {
    fetchError.value = e.message;
  }
}

// Refetch on page / filter change
watch([page, search, filterType, filterDifficulty], (newVals, oldVals) => {
  // If a filter changed (not the page itself), reset to page 1
  const filterChanged =
    newVals[1] !== oldVals[1] ||
    newVals[2] !== oldVals[2] ||
    newVals[3] !== oldVals[3];
  if (filterChanged && page.value !== 1) {
    page.value = 1;
    return; // watcher will retrigger because of page change
  }
  fetchPois();
});

function clearFilters() {
  searchInput.value = "";
  search.value = "";
  filterType.value = undefined;
  filterDifficulty.value = undefined;
}

function onEdit(poi: PoiDefinition) {
  navigateTo(`/pois/${poi.id}`);
}

function onDeleteRequest(poi: PoiDefinition) {
  poiToDelete.value = poi;
}

async function confirmDelete() {
  if (!poiToDelete.value) return;
  try {
    await deletePoi(poiToDelete.value.id);
    await fetchPois();
  } catch (e: any) {
    fetchError.value = e.message;
  }
  poiToDelete.value = null;
}

onMounted(async () => {
  await fetchMeta();
  await fetchPois();
});
</script>
