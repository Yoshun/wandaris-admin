<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Import de POIs" icon="i-lucide-download" />
    </template>

    <template #body>
      <div class="p-4 space-y-4">
        <!-- Top: Leaflet map (full width, compact height) + import controls -->
        <div class="flex flex-wrap gap-4 items-start">
          <div class="flex-1 min-w-[300px]">
            <div class="h-[250px] rounded-lg overflow-hidden">
              <ClientOnly>
                <ImportMap
                  :zones="zones"
                  :preview-radius="radius"
                  @map-click="onMapClick"
                />
              </ClientOnly>
            </div>
          </div>
          <div class="bg-elevated border border-default rounded-lg p-4 w-full sm:w-auto">
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
        </div>

        <!-- Bottom: Staged POI review -->
        <div v-if="staged.length > 0" class="flex items-center justify-between">
          <span class="text-muted">{{ currentIndex + 1 }} / {{ staged.length }} POI(s) en attente</span>
          <UButton @click="approveAll">Tout valider</UButton>
        </div>

        <div v-if="loadingStaged" class="space-y-2">
          <USkeleton class="h-14 w-full" />
          <USkeleton class="h-[400px] w-full" />
        </div>

        <div v-else-if="staged.length === 0 && !loadingStaged" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
          <p class="text-muted">Aucun POI en attente. Cliquez sur la carte pour importer une zone.</p>
        </div>

        <template v-else-if="currentPoi">
          <div class="bg-elevated border border-default rounded-lg p-3 space-y-3">
            <div class="flex flex-wrap gap-2 items-center">
              <div class="flex-1 min-w-[150px]">
                <UInput v-model="currentPoi.name" class="w-full" @blur="saveStaged(currentPoi)" />
              </div>
              <USelect
                v-model="currentPoi.type"
                :items="typeOptions"
                class="w-full sm:w-32"
                @update:model-value="saveStaged(currentPoi)"
              />
              <USelect
                v-model="currentPoi.difficulty"
                :items="difficultyOptions"
                class="w-full sm:w-28"
                @update:model-value="saveStaged(currentPoi)"
              />
              <div class="flex gap-2">
                <UButton color="error" :disabled="busyPoiId === currentPoi.id" :loading="busyPoiId === currentPoi.id" @click="reject(currentPoi)">
                  Refuser
                </UButton>
                <UButton :disabled="busyPoiId === currentPoi.id" :loading="busyPoiId === currentPoi.id" @click="approve(currentPoi)">
                  Valider
                </UButton>
              </div>
            </div>

            <!-- Embedded Google Maps (satellite, zoom 19) -->
            <iframe
              :key="currentPoi.id"
              :src="`https://maps.google.com/maps?q=${currentPoi.lat},${currentPoi.lon}&z=19&t=k&output=embed`"
              class="w-full rounded-lg border border-default"
              style="height: calc(100vh - 28rem)"
              frameborder="0"
              allowfullscreen
              loading="lazy"
            />
          </div>
        </template>
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
const currentIndex = ref(0);
const currentPoi = computed(() => staged.value[currentIndex.value] ?? null);

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
    currentIndex.value = 0;
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

function removeFromStaged(poiId: number) {
  staged.value = staged.value.filter((p) => p.id !== poiId);
  if (currentIndex.value >= staged.value.length && staged.value.length > 0) {
    currentIndex.value = staged.value.length - 1;
  }
}

async function approve(poi: StagedPoi) {
  if (busyPoiId.value !== null) return;
  busyPoiId.value = poi.id;
  try {
    await approveStaged(poi.id);
    removeFromStaged(poi.id);
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
    removeFromStaged(poi.id);
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
