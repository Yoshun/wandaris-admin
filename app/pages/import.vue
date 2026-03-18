<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Import de POIs" icon="i-lucide-download" />
    </template>

    <template #body>
      <div class="p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left: Map -->
          <div>
            <div class="h-[calc(100vh-10rem)] min-h-[400px] rounded-lg overflow-hidden">
              <ClientOnly>
                <ImportMap
                  :zones="zones"
                  :preview-radius="radius"
                  @map-click="onMapClick"
                />
              </ClientOnly>
            </div>
            <p class="text-dimmed mt-2">
              Cliquez sur la carte pour choisir le centre de l'import.
              Les zones grises sont deja couvertes.
            </p>
          </div>

          <!-- Right: Controls + Staged list -->
          <div class="h-[calc(100vh-10rem)] min-h-[400px] overflow-y-auto space-y-4">
            <!-- Import controls -->
            <div class="bg-elevated border border-default rounded-lg p-4">
              <div class="flex flex-wrap gap-3 items-end">
                <UFormField label="Coordonnees" class="flex-1 min-w-[120px]">
                  <div>
                    <template v-if="clickedLat !== null">
                      {{ clickedLat.toFixed(5) }}, {{ clickedLon!.toFixed(5) }}
                    </template>
                    <span v-else class="text-dimmed">Cliquez sur la carte</span>
                  </div>
                </UFormField>
                <UFormField label="Rayon (km)">
                  <UInput v-model.number="radiusKm" type="number" :min="1" :max="50" class="w-full sm:w-20" />
                </UFormField>
                <UButton :disabled="importing || clickedLat === null" :loading="importing" @click="runImport">
                  Importer cette zone
                </UButton>
              </div>
              <p v-if="importMessage" class="mt-2" :class="importError ? 'text-error' : 'text-success'">
                {{ importMessage }}
              </p>
            </div>

            <!-- Staged POIs -->
            <div v-if="staged.length > 0" class="flex items-center justify-between">
              <span class="text-muted">{{ staged.length }} POI(s) en attente</span>
              <UButton color="success" variant="solid" @click="approveAll">Tout valider</UButton>
            </div>

            <div v-if="loadingStaged" class="space-y-2">
              <USkeleton class="h-14 w-full" />
              <USkeleton class="h-14 w-full" />
            </div>

            <div v-else-if="staged.length === 0 && !loadingStaged" class="flex flex-col items-center justify-center py-12">
              <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
              <p class="text-muted">Aucun POI en attente. Cliquez sur la carte pour importer une zone.</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="poi in staged"
                :key="poi.id"
                class="bg-elevated border border-default rounded-lg p-3"
              >
                <div class="flex flex-wrap gap-2 items-start">
                  <div class="flex-1 min-w-[150px]">
                    <UInput v-model="poi.name" class="w-full" @blur="saveStaged(poi)" />
                  </div>
                  <USelect
                    v-model="poi.type"
                    :items="typeOptions"
                    class="w-full sm:w-32"
                    @update:model-value="saveStaged(poi)"
                  />
                  <USelect
                    v-model="poi.difficulty"
                    :items="difficultyOptions"
                    class="w-full sm:w-28"
                    @update:model-value="saveStaged(poi)"
                  />
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`"
                    target="_blank"
                    class="text-primary hover:underline pt-2"
                  >Google Maps</a>
                  <div class="flex gap-1">
                    <UButton size="sm" color="success" variant="solid" :disabled="busyPoiId === poi.id" :loading="busyPoiId === poi.id" @click="approve(poi)">Valider</UButton>
                    <UButton size="sm" color="error" variant="solid" :disabled="busyPoiId === poi.id" :loading="busyPoiId === poi.id" @click="reject(poi)">Refuser</UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { StagedPoi, ImportZone, PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

const {
  importOverpass, listStaging, updateStaging,
  approveStaged, rejectStaged, approveAllStaged,
  listImportZones,
  listPoiTypes, listPoiDifficulties,
} = useApi();

const zones = ref<ImportZone[]>([]);
const staged = ref<StagedPoi[]>([]);
const loadingStaged = ref(true);

const clickedLat = ref<number | null>(null);
const clickedLon = ref<number | null>(null);
const radiusKm = ref(10);
const radius = computed(() => radiusKm.value * 1000);

const importing = ref(false);
const importMessage = ref("");
const importError = ref(false);
const busyPoiId = ref<number | null>(null);

const poiTypesData = ref<PoiTypeRecord[]>([]);
const poiDifficultiesData = ref<PoiDifficultyRecord[]>([]);

const typeOptions = computed(() =>
  poiTypesData.value.map((t) => ({ label: typeLabel(t.slug), value: t.slug }))
);
const difficultyOptions = computed(() =>
  poiDifficultiesData.value.map((d) => ({ label: difficultyLabel(d.slug), value: d.slug }))
);

async function fetchAll() {
  loadingStaged.value = true;
  try {
    const [z, s, t, d] = await Promise.all([
      listImportZones(), listStaging(), listPoiTypes(), listPoiDifficulties(),
    ]);
    zones.value = z;
    staged.value = s;
    poiTypesData.value = t;
    poiDifficultiesData.value = d;
  } catch (e: any) {
    importMessage.value = e.message;
    importError.value = true;
  } finally {
    loadingStaged.value = false;
  }
}

function onMapClick(latlng: { lat: number; lon: number }) {
  clickedLat.value = latlng.lat;
  clickedLon.value = latlng.lon;
  importMessage.value = "";
}

async function runImport() {
  if (clickedLat.value === null || clickedLon.value === null) return;
  importing.value = true;
  importMessage.value = "";
  importError.value = false;
  try {
    const result = await importOverpass(clickedLat.value, clickedLon.value, radius.value);
    importMessage.value = `${result.inserted} nouveaux POIs (${result.skipped} ignores sur ${result.total} elements)`;
    const [z, s] = await Promise.all([listImportZones(), listStaging()]);
    zones.value = z;
    staged.value = s;
  } catch (e: any) {
    importMessage.value = e.message;
    importError.value = true;
  } finally {
    importing.value = false;
  }
}

async function saveStaged(poi: StagedPoi) {
  try {
    await updateStaging(poi.id, { name: poi.name, type: poi.type, difficulty: poi.difficulty });
  } catch (e: any) {
    importMessage.value = `Erreur: ${e.message}`;
    importError.value = true;
  }
}

async function approve(poi: StagedPoi) {
  if (busyPoiId.value !== null) return;
  busyPoiId.value = poi.id;
  try {
    await approveStaged(poi.id);
    staged.value = staged.value.filter((p) => p.id !== poi.id);
  } catch (e: any) {
    importMessage.value = e.message;
    importError.value = true;
  } finally {
    busyPoiId.value = null;
  }
}

async function reject(poi: StagedPoi) {
  if (busyPoiId.value !== null) return;
  busyPoiId.value = poi.id;
  try {
    await rejectStaged(poi.id);
    staged.value = staged.value.filter((p) => p.id !== poi.id);
  } catch (e: any) {
    importMessage.value = e.message;
    importError.value = true;
  } finally {
    busyPoiId.value = null;
  }
}

async function approveAll() {
  try {
    const result = await approveAllStaged();
    staged.value = [];
    importMessage.value = `${result.approved} POIs valides`;
    importError.value = false;
  } catch (e: any) {
    importMessage.value = e.message;
    importError.value = true;
  }
}

onMounted(fetchAll);
</script>
