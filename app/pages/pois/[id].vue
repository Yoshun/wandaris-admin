<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="title" icon="i-lucide-map-pin">
        <template #leading>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-arrow-left"
            @click="navigateTo('/')"
          >
            Retour
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="space-y-3 w-full max-w-md">
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-5/6" />
        </div>
      </div>
      <div v-else-if="loadError" class="text-error p-4">{{ loadError }}</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4">
        <!-- Form (left) -->
        <div class="overflow-y-auto">
          <PoiForm
            ref="formRef"
            :title="title"
            :submit-label="isNew ? 'Creer' : 'Enregistrer'"
            :initial-data="initialData ?? undefined"
            :poi-types="poiTypesData"
            :poi-difficulties="poiDifficultiesData"
            :loading="saving"
            :error="saveError"
            @submit="handleSubmit"
            @cancel="navigateTo('/')"
            @coords-changed="onFormCoordsChanged"
          />
        </div>

        <!-- Map (right) -->
        <div class="h-[calc(100vh-12rem)] min-h-[400px] rounded-lg overflow-hidden">
          <ClientOnly>
            <PoiMap
              ref="mapRef"
              :pois="mapPois"
              :selected-id="poiId ?? undefined"
              clickable
              @map-click="onMapClick"
            />
          </ClientOnly>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PoiDefinition, CreatePoiInput, PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";

const route = useRoute();
const { getPoi, createPoi, updatePoi, listPoiTypes, listPoiDifficulties } = useApi();

const idParam = computed(() => route.params.id as string);
const isNew = computed(() => idParam.value === "new");
const poiId = computed<number | null>(() => {
  if (isNew.value) return null;
  const n = parseInt(idParam.value, 10);
  return Number.isFinite(n) ? n : null;
});

const loading = ref(true);
const loadError = ref("");
const saving = ref(false);
const saveError = ref("");

const poi = ref<PoiDefinition | null>(null);
const poiTypesData = ref<PoiTypeRecord[]>([]);
const poiDifficultiesData = ref<PoiDifficultyRecord[]>([]);

const mapRef = ref<{ setClickPosition: (lat: number, lon: number) => void; panTo: (lat: number, lon: number) => void }>();
const formRef = ref<{ setCoords: (lat: number, lon: number) => void }>();

const title = computed(() =>
  isNew.value ? "Nouveau POI" : poi.value ? `Modifier : ${poi.value.name}` : "Modifier le POI"
);

const initialData = computed(() => {
  if (isNew.value) return null;
  if (!poi.value) return null;
  return {
    name: poi.value.name,
    type: poi.value.type,
    difficulty: poi.value.difficulty,
    lat: poi.value.lat,
    lon: poi.value.lon,
  };
});

const mapPois = computed<PoiDefinition[]>(() => (poi.value ? [poi.value] : []));

async function loadAll() {
  loading.value = true;
  loadError.value = "";
  try {
    const [types, difficulties] = await Promise.all([listPoiTypes(), listPoiDifficulties()]);
    poiTypesData.value = types;
    poiDifficultiesData.value = difficulties;

    if (!isNew.value) {
      if (poiId.value === null) {
        loadError.value = "Identifiant POI invalide";
        return;
      }
      poi.value = await getPoi(poiId.value);
      // Center the map on the POI after a tick (so the map is mounted)
      await nextTick();
      mapRef.value?.panTo(poi.value.lat, poi.value.lon);
      mapRef.value?.setClickPosition(poi.value.lat, poi.value.lon);
    }
  } catch (e: any) {
    loadError.value = e.message;
  } finally {
    loading.value = false;
  }
}

function onMapClick(latlng: { lat: number; lon: number }) {
  formRef.value?.setCoords(latlng.lat, latlng.lon);
}

function onFormCoordsChanged(coords: { lat: number; lon: number }) {
  mapRef.value?.setClickPosition(coords.lat, coords.lon);
  // Pan the map to follow the new position (e.g. when pasting a Google Maps link)
  mapRef.value?.panTo(coords.lat, coords.lon);
}

async function handleSubmit(data: CreatePoiInput) {
  saving.value = true;
  saveError.value = "";
  try {
    if (isNew.value) {
      await createPoi(data);
    } else if (poiId.value !== null) {
      await updatePoi(poiId.value, data);
    }
    navigateTo("/");
  } catch (e: any) {
    saveError.value = e.message;
  } finally {
    saving.value = false;
  }
}

onMounted(loadAll);
</script>
