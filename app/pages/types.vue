<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">Types & Difficultes</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- POI Types -->
      <div>
        <h2 class="text-lg font-bold text-primary mb-3">Types de POI</h2>

        <!-- Add form -->
        <div class="flex gap-2 mb-4">
          <UInput v-model="newTypeSlug" placeholder="nouveau_slug" size="sm" class="flex-1" />
          <UButton size="sm" :disabled="!newTypeSlug.trim()" @click="addType">Ajouter</UButton>
        </div>

        <div v-if="loadingTypes" class="text-muted text-sm">Chargement...</div>
        <div v-else class="space-y-1">
          <div
            v-for="(t, idx) in types"
            :key="t.id"
            class="flex items-center gap-2 bg-elevated border border-default rounded px-3 py-2"
          >
            <div class="flex flex-col gap-0.5">
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="idx === 0"
                @click="moveType(t, idx, -1)"
              >↑</UButton>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="idx === types.length - 1"
                @click="moveType(t, idx, 1)"
              >↓</UButton>
            </div>
            <template v-if="editingTypeId === t.id">
              <UInput v-model="editingTypeSlug" size="sm" class="flex-1" @keyup.enter="saveType(t)" />
              <UButton size="xs" @click="saveType(t)">OK</UButton>
              <UButton size="xs" variant="solid" color="neutral" @click="cancelEditType">Annuler</UButton>
            </template>
            <template v-else>
              <span class="flex-1 text-sm">{{ typeLabel(t.slug) }} <span class="text-dimmed">({{ t.slug }})</span></span>
              <UButton size="xs" variant="soft" @click="startEditType(t)">Modifier</UButton>
              <UButton size="xs" variant="solid" color="error" @click="confirmDeleteType(t)">Supprimer</UButton>
            </template>
          </div>
        </div>
      </div>

      <!-- POI Difficulties -->
      <div>
        <h2 class="text-lg font-bold text-primary mb-3">Difficultes</h2>

        <!-- Add form -->
        <div class="flex gap-2 mb-4">
          <UInput v-model="newDiffSlug" placeholder="nouveau_slug" size="sm" class="flex-1" />
          <UButton size="sm" :disabled="!newDiffSlug.trim()" @click="addDifficulty">Ajouter</UButton>
        </div>

        <div v-if="loadingDiffs" class="text-muted text-sm">Chargement...</div>
        <div v-else class="space-y-1">
          <div
            v-for="(d, idx) in difficulties"
            :key="d.id"
            class="flex items-center gap-2 bg-elevated border border-default rounded px-3 py-2"
          >
            <div class="flex flex-col gap-0.5">
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="idx === 0"
                @click="moveDifficulty(d, idx, -1)"
              >↑</UButton>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="idx === difficulties.length - 1"
                @click="moveDifficulty(d, idx, 1)"
              >↓</UButton>
            </div>
            <template v-if="editingDiffId === d.id">
              <UInput v-model="editingDiffSlug" size="sm" class="flex-1" @keyup.enter="saveDifficulty(d)" />
              <UButton size="xs" @click="saveDifficulty(d)">OK</UButton>
              <UButton size="xs" variant="solid" color="neutral" @click="cancelEditDiff">Annuler</UButton>
            </template>
            <template v-else>
              <span class="flex-1 text-sm">{{ difficultyLabel(d.slug) }} <span class="text-dimmed">({{ d.slug }})</span></span>
              <UButton size="xs" variant="soft" @click="startEditDiff(d)">Modifier</UButton>
              <UButton size="xs" variant="solid" color="error" @click="confirmDeleteDiff(d)">Supprimer</UButton>
            </template>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMsg" class="text-error text-sm mt-4">{{ errorMsg }}</p>

    <ConfirmDialog
      :visible="!!deleteTarget"
      :message="`Supprimer « ${deleteTarget?.slug} » ?`"
      @confirm="executeDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

const {
  listPoiTypes, createPoiType, updatePoiType, deletePoiType,
  listPoiDifficulties, createPoiDifficulty, updatePoiDifficulty, deletePoiDifficulty,
} = useApi();

const types = ref<PoiTypeRecord[]>([]);
const difficulties = ref<PoiDifficultyRecord[]>([]);
const loadingTypes = ref(true);
const loadingDiffs = ref(true);
const errorMsg = ref("");

// Add forms
const newTypeSlug = ref("");
const newDiffSlug = ref("");

// Inline editing — types
const editingTypeId = ref<number | null>(null);
const editingTypeSlug = ref("");

// Inline editing — difficulties
const editingDiffId = ref<number | null>(null);
const editingDiffSlug = ref("");

// Delete confirmation
const deleteTarget = ref<{ kind: "type" | "difficulty"; id: number; slug: string } | null>(null);

async function fetchTypes() {
  loadingTypes.value = true;
  try {
    types.value = await listPoiTypes();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loadingTypes.value = false;
  }
}

async function fetchDifficulties() {
  loadingDiffs.value = true;
  try {
    difficulties.value = await listPoiDifficulties();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loadingDiffs.value = false;
  }
}

// --- Types CRUD ---

async function addType() {
  const slug = newTypeSlug.value.trim();
  if (!slug) return;
  errorMsg.value = "";
  try {
    const maxPos = types.value.length > 0 ? Math.max(...types.value.map((t) => t.position)) + 1 : 0;
    const created = await createPoiType({ slug, position: maxPos });
    types.value.push(created);
    newTypeSlug.value = "";
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

function startEditType(t: PoiTypeRecord) {
  editingTypeId.value = t.id;
  editingTypeSlug.value = t.slug;
}

function cancelEditType() {
  editingTypeId.value = null;
}

async function saveType(t: PoiTypeRecord) {
  errorMsg.value = "";
  try {
    const updated = await updatePoiType(t.id, { slug: editingTypeSlug.value.trim() });
    const idx = types.value.findIndex((x) => x.id === t.id);
    if (idx >= 0) types.value[idx] = updated;
    editingTypeId.value = null;
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

async function moveType(t: PoiTypeRecord, idx: number, dir: -1 | 1) {
  const neighbor = types.value[idx + dir];
  if (!neighbor) return;
  errorMsg.value = "";
  try {
    const [u1, u2] = await Promise.all([
      updatePoiType(t.id, { position: neighbor.position }),
      updatePoiType(neighbor.id, { position: t.position }),
    ]);
    types.value[idx] = u2;
    types.value[idx + dir] = u1;
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

function confirmDeleteType(t: PoiTypeRecord) {
  deleteTarget.value = { kind: "type", id: t.id, slug: t.slug };
}

// --- Difficulties CRUD ---

async function addDifficulty() {
  const slug = newDiffSlug.value.trim();
  if (!slug) return;
  errorMsg.value = "";
  try {
    const maxPos = difficulties.value.length > 0 ? Math.max(...difficulties.value.map((d) => d.position)) + 1 : 0;
    const created = await createPoiDifficulty({ slug, position: maxPos });
    difficulties.value.push(created);
    newDiffSlug.value = "";
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

function startEditDiff(d: PoiDifficultyRecord) {
  editingDiffId.value = d.id;
  editingDiffSlug.value = d.slug;
}

function cancelEditDiff() {
  editingDiffId.value = null;
}

async function saveDifficulty(d: PoiDifficultyRecord) {
  errorMsg.value = "";
  try {
    const updated = await updatePoiDifficulty(d.id, { slug: editingDiffSlug.value.trim() });
    const idx = difficulties.value.findIndex((x) => x.id === d.id);
    if (idx >= 0) difficulties.value[idx] = updated;
    editingDiffId.value = null;
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

async function moveDifficulty(d: PoiDifficultyRecord, idx: number, dir: -1 | 1) {
  const neighbor = difficulties.value[idx + dir];
  if (!neighbor) return;
  errorMsg.value = "";
  try {
    const [u1, u2] = await Promise.all([
      updatePoiDifficulty(d.id, { position: neighbor.position }),
      updatePoiDifficulty(neighbor.id, { position: d.position }),
    ]);
    difficulties.value[idx] = u2;
    difficulties.value[idx + dir] = u1;
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

function confirmDeleteDiff(d: PoiDifficultyRecord) {
  deleteTarget.value = { kind: "difficulty", id: d.id, slug: d.slug };
}

// --- Shared delete ---

async function executeDelete() {
  if (!deleteTarget.value) return;
  errorMsg.value = "";
  try {
    if (deleteTarget.value.kind === "type") {
      await deletePoiType(deleteTarget.value.id);
      types.value = types.value.filter((t) => t.id !== deleteTarget.value!.id);
    } else {
      await deletePoiDifficulty(deleteTarget.value.id);
      difficulties.value = difficulties.value.filter((d) => d.id !== deleteTarget.value!.id);
    }
  } catch (e: any) {
    errorMsg.value = e.message;
  }
  deleteTarget.value = null;
}

onMounted(() => {
  fetchTypes();
  fetchDifficulties();
});
</script>
