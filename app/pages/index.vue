<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-primary">Dashboard</h1>
      <UButton v-if="panel === 'list' && can('pois.manage')" @click="startCreate">+ Nouveau POI</UButton>
    </div>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else-if="fetchError" class="text-error">{{ fetchError }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Map -->
      <div class="h-[calc(100vh-12rem)] min-h-[400px] rounded-lg overflow-hidden">
        <ClientOnly>
          <PoiMap
            ref="mapRef"
            :pois="pois"
            :selected-id="selectedId"
            :clickable="panel !== 'list'"
            @poi-click="onMapPoiClick"
            @map-click="onMapClick"
          />
        </ClientOnly>
      </div>

      <!-- Right panel: list OR form -->
      <div class="h-[calc(100vh-12rem)] min-h-[400px] overflow-y-auto">
        <!-- List mode -->
        <template v-if="panel === 'list'">
          <PoiList
            :pois="pois"
            :readonly="!can('pois.manage')"
            @select="onListSelect"
            @edit="startEdit"
            @delete="onDeleteRequest"
          />
        </template>

        <!-- Create mode -->
        <template v-else-if="panel === 'create'">
          <PoiForm
            ref="formRef"
            title="Nouveau POI"
            submit-label="Creer"
            :loading="saving"
            :error="saveError"
            @submit="handleCreate"
            @cancel="closePanel"
            @coords-changed="onFormCoordsChanged"
          />
        </template>

        <!-- Edit mode -->
        <template v-else-if="panel === 'edit'">
          <PoiForm
            ref="formRef"
            :key="formKey"
            title="Modifier le POI"
            submit-label="Enregistrer"
            :initial-data="editData!"
            :loading="saving"
            :error="saveError"
            @submit="handleUpdate"
            @cancel="closePanel"
            @coords-changed="onFormCoordsChanged"
          />
        </template>
      </div>
    </div>

    <ConfirmDialog
      :visible="!!poiToDelete"
      :message="`Supprimer le POI \u00AB ${poiToDelete?.name} \u00BB ?`"
      @confirm="confirmDelete"
      @cancel="poiToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { PoiDefinition, CreatePoiInput } from "~~/types/poi";

const { can } = useAuth();
const { listPois, createPoi, updatePoi, deletePoi } = useApi();

const pois = ref<PoiDefinition[]>([]);
const loading = ref(true);
const fetchError = ref("");
const saving = ref(false);
const saveError = ref("");
const selectedId = ref<number | null>(null);
const poiToDelete = ref<PoiDefinition | null>(null);

type PanelMode = "list" | "create" | "edit";
const panel = ref<PanelMode>("list");
const editPoiId = ref<number | null>(null);
const formKey = ref(0);

const mapRef = ref<{ setClickPosition: (lat: number, lon: number) => void; panTo: (lat: number, lon: number) => void }>();
const formRef = ref<{ setCoords: (lat: number, lon: number) => void }>();

const editData = computed(() => {
  if (!editPoiId.value) return null;
  const poi = pois.value.find((p) => p.id === editPoiId.value);
  if (!poi) return null;
  return { id: poi.id, name: poi.name, type: poi.type, difficulty: poi.difficulty, lat: poi.lat, lon: poi.lon };
});

async function fetchPois() {
  loading.value = true;
  fetchError.value = "";
  try {
    pois.value = await listPois();
  } catch (e: any) {
    fetchError.value = e.message;
  } finally {
    loading.value = false;
  }
}

// --- Panel navigation ---

function startCreate() {
  panel.value = "create";
  editPoiId.value = null;
  selectedId.value = null;
  saveError.value = "";
  formKey.value++;
}

function startEdit(poi: PoiDefinition) {
  editPoiId.value = poi.id;
  selectedId.value = poi.id;
  saveError.value = "";
  panel.value = "edit";
  formKey.value++;
}

function closePanel() {
  panel.value = "list";
  editPoiId.value = null;
  saveError.value = "";
}

// --- Map interactions ---

function onMapPoiClick(poi: PoiDefinition) {
  startEdit(poi);
}

function onMapClick(latlng: { lat: number; lon: number }) {
  if (panel.value !== "list" && formRef.value) {
    formRef.value.setCoords(latlng.lat, latlng.lon);
  }
}

function onFormCoordsChanged(coords: { lat: number; lon: number }) {
  mapRef.value?.setClickPosition(coords.lat, coords.lon);
}

function onListSelect(poi: PoiDefinition) {
  selectedId.value = poi.id;
  mapRef.value?.panTo(poi.lat, poi.lon);
}

// --- CRUD ---

async function handleCreate(data: CreatePoiInput) {
  saving.value = true;
  saveError.value = "";
  try {
    const created = await createPoi(data);
    pois.value.push(created);
    closePanel();
  } catch (e: any) {
    saveError.value = e.message;
  } finally {
    saving.value = false;
  }
}

async function handleUpdate(data: CreatePoiInput) {
  if (!editPoiId.value) return;
  saving.value = true;
  saveError.value = "";
  try {
    const updated = await updatePoi(editPoiId.value, data);
    const idx = pois.value.findIndex((p) => p.id === editPoiId.value);
    if (idx >= 0) pois.value[idx] = updated;
    closePanel();
  } catch (e: any) {
    saveError.value = e.message;
  } finally {
    saving.value = false;
  }
}

function onDeleteRequest(poi: PoiDefinition) {
  poiToDelete.value = poi;
}

async function confirmDelete() {
  if (!poiToDelete.value) return;
  try {
    await deletePoi(poiToDelete.value.id);
    pois.value = pois.value.filter((p) => p.id !== poiToDelete.value!.id);
    if (editPoiId.value === poiToDelete.value.id) closePanel();
  } catch (e: any) {
    fetchError.value = e.message;
  }
  poiToDelete.value = null;
}

onMounted(fetchPois);
</script>
