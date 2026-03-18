<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Types & Difficultes" icon="i-lucide-tags" />
    </template>

    <template #body>
      <div class="p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- POI Types -->
          <div class="bg-elevated border border-default rounded-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-default">
              <h2 class="text-lg font-bold text-primary">Types de POI</h2>
            </div>
            <div class="p-4">
              <!-- Add form -->
              <div class="flex gap-2 mb-4">
                <UInput v-model="newTypeSlug" placeholder="nouveau_slug" class="flex-1" />
                <USelect v-model="newTypeBiome" :items="biomeItems" size="sm" class="w-36" />
                <UButton size="sm" :disabled="!newTypeSlug.trim()" @click="addType">Ajouter</UButton>
              </div>

              <div v-if="loadingTypes" class="space-y-2">
                <USkeleton class="h-10 w-full" />
                <USkeleton class="h-10 w-full" />
              </div>
              <div v-else class="space-y-1">
                <div
                  v-for="(t, idx) in types"
                  :key="t.id"
                  class="flex items-center gap-2 border border-default rounded-lg px-3 py-2"
                >
                  <div class="flex flex-col gap-0.5">
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="neutral"
                      :disabled="idx === 0"
                      @click="moveType(t, idx, -1)"
                    >↑</UButton>
                    <UButton
                      size="sm"
                      variant="ghost"
                      color="neutral"
                      :disabled="idx === types.length - 1"
                      @click="moveType(t, idx, 1)"
                    >↓</UButton>
                  </div>
                  <template v-if="editingTypeId === t.id">
                    <UInput v-model="editingTypeSlug" size="sm" class="flex-1" @keyup.enter="saveType(t)" />
                    <USelect v-model="editingTypeBiome" :items="biomeItems" size="sm" class="w-36" />
                    <UButton size="sm" @click="saveType(t)">OK</UButton>
                    <UButton size="sm" variant="solid" color="neutral" @click="cancelEditType">Annuler</UButton>
                  </template>
                  <template v-else>
                    <span class="flex-1">{{ typeLabel(t.slug) }} <span class="text-dimmed">({{ t.slug }})</span></span>
                    <span class="text-muted bg-default px-2 py-0.5 rounded">{{ t.biome }}</span>
                    <UButton size="sm" variant="soft" @click="startEditType(t)">Modifier</UButton>
                    <UButton size="sm" variant="outline" color="neutral" @click="confirmDeleteType(t)">Supprimer</UButton>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- POI Difficulties -->
          <div class="bg-elevated border border-default rounded-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-default">
              <h2 class="text-lg font-bold text-primary">Difficultes</h2>
            </div>
            <div class="p-4">
              <!-- Add form -->
              <div class="flex gap-2 mb-4">
                <UInput v-model="newDiffSlug" placeholder="nouveau_slug" class="flex-1" />
                <UButton size="sm" :disabled="!newDiffSlug.trim()" @click="addDifficulty">Ajouter</UButton>
              </div>

              <div v-if="loadingDiffs" class="space-y-2">
                <USkeleton class="h-10 w-full" />
                <USkeleton class="h-10 w-full" />
              </div>
              <div v-else class="space-y-1">
                <div
                  v-for="(d, idx) in difficulties"
                  :key="d.id"
                  class="border border-default rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex flex-col gap-0.5">
                      <UButton
                        size="sm"
                        variant="ghost"
                        color="neutral"
                        :disabled="idx === 0"
                        @click="moveDifficulty(d, idx, -1)"
                      >↑</UButton>
                      <UButton
                        size="sm"
                        variant="ghost"
                        color="neutral"
                        :disabled="idx === difficulties.length - 1"
                        @click="moveDifficulty(d, idx, 1)"
                      >↓</UButton>
                    </div>
                    <template v-if="editingDiffId === d.id">
                      <UInput v-model="editingDiffSlug" size="sm" class="flex-1" @keyup.enter="saveDifficulty(d)" />
                      <UButton size="sm" @click="saveDifficulty(d)">OK</UButton>
                      <UButton size="sm" variant="solid" color="neutral" @click="cancelEditDiff">Annuler</UButton>
                    </template>
                    <template v-else>
                      <span class="flex-1">{{ difficultyLabel(d.slug) }} <span class="text-dimmed">({{ d.slug }})</span></span>
                      <UButton size="sm" variant="soft" @click="startEditDiff(d)">Modifier</UButton>
                      <UButton size="sm" variant="ghost" @click="toggleDiffExpand(d.id)">
                        {{ expandedDiffId === d.id ? '▲' : '▼' }}
                      </UButton>
                      <UButton size="sm" variant="outline" color="neutral" @click="confirmDeleteDiff(d)">Supprimer</UButton>
                    </template>
                  </div>

                  <!-- Gameplay fields (always visible) -->
                  <div class="grid grid-cols-3 gap-2 mt-2">
                    <UFormField label="Cooldown (h)">
                      <UInput
                        type="number"
                        :model-value="d.cooldownHours"
                        size="sm"
                        @change="updateDiffField(d, 'cooldownHours', Number(($event.target as HTMLInputElement).value))"
                      />
                    </UFormField>
                    <UFormField label="XP">
                      <UInput
                        type="number"
                        :model-value="d.rewardXp"
                        size="sm"
                        @change="updateDiffField(d, 'rewardXp', Number(($event.target as HTMLInputElement).value))"
                      />
                    </UFormField>
                    <UFormField label="Gold">
                      <UInput
                        type="number"
                        :model-value="d.rewardGold"
                        size="sm"
                        @change="updateDiffField(d, 'rewardGold', Number(($event.target as HTMLInputElement).value))"
                      />
                    </UFormField>
                  </div>

                  <!-- Loot table (expandable) -->
                  <div v-if="expandedDiffId === d.id" class="mt-2 border-t border-default pt-2">
                    <p class="text-muted mb-1 font-semibold">Loot Table</p>
                    <div class="space-y-1">
                      <div v-for="res in resourceSlugs" :key="res" class="grid grid-cols-4 gap-1 items-center">
                        <span class="text-muted capitalize">{{ res }}</span>
                        <UInput
                          type="number"
                          step="0.1"
                          placeholder="chance"
                          :model-value="d.lootTable[res]?.chance ?? 0"
                          size="sm"
                          @change="updateLootField(d, res, 'chance', Number(($event.target as HTMLInputElement).value))"
                        />
                        <UInput
                          type="number"
                          placeholder="min"
                          :model-value="d.lootTable[res]?.min ?? 0"
                          size="sm"
                          @change="updateLootField(d, res, 'min', Number(($event.target as HTMLInputElement).value))"
                        />
                        <UInput
                          type="number"
                          placeholder="max"
                          :model-value="d.lootTable[res]?.max ?? 0"
                          size="sm"
                          @change="updateLootField(d, res, 'max', Number(($event.target as HTMLInputElement).value))"
                        />
                      </div>
                      <div class="text-dimmed mt-1">chance (0-1) | min | max</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="text-error mt-4">{{ errorMsg }}</p>

        <ConfirmDialog
          :visible="!!deleteTarget"
          :message="`Supprimer « ${deleteTarget?.slug} » ?`"
          @confirm="executeDelete"
          @cancel="deleteTarget = null"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel } from "~/utils/i18n";

const {
  listPoiTypes, createPoiType, updatePoiType, deletePoiType,
  listPoiDifficulties, createPoiDifficulty, updatePoiDifficulty, deletePoiDifficulty,
  fetchGameConfig,
} = useApi();

// Dynamic resource slugs for loot table (loaded from API)
const resourceSlugs = ref<string[]>(['wood', 'ore', 'fabric', 'leather']);

const biomeItems = [
  { label: 'Wilderness', value: 'wilderness' },
  { label: 'Urban', value: 'urban' },
  { label: 'Forest', value: 'forest' },
  { label: 'Mountain', value: 'mountain' },
];

const types = ref<PoiTypeRecord[]>([]);
const difficulties = ref<PoiDifficultyRecord[]>([]);
const loadingTypes = ref(true);
const loadingDiffs = ref(true);
const errorMsg = ref("");

// Add forms
const newTypeSlug = ref("");
const newTypeBiome = ref("wilderness");
const newDiffSlug = ref("");

// Inline editing — types
const editingTypeId = ref<number | null>(null);
const editingTypeSlug = ref("");
const editingTypeBiome = ref("wilderness");

// Inline editing — difficulties
const editingDiffId = ref<number | null>(null);
const editingDiffSlug = ref("");

// Expand loot table
const expandedDiffId = ref<number | null>(null);

// Delete confirmation
const deleteTarget = ref<{ kind: "type" | "difficulty"; id: number; slug: string } | null>(null);

function toggleDiffExpand(id: number) {
  expandedDiffId.value = expandedDiffId.value === id ? null : id;
}

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
    const created = await createPoiType({ slug, position: maxPos, biome: newTypeBiome.value });
    types.value.push(created);
    newTypeSlug.value = "";
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

function startEditType(t: PoiTypeRecord) {
  editingTypeId.value = t.id;
  editingTypeSlug.value = t.slug;
  editingTypeBiome.value = t.biome;
}

function cancelEditType() {
  editingTypeId.value = null;
}

async function saveType(t: PoiTypeRecord) {
  errorMsg.value = "";
  try {
    const updated = await updatePoiType(t.id, { slug: editingTypeSlug.value.trim(), biome: editingTypeBiome.value });
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

async function updateDiffField(d: PoiDifficultyRecord, field: 'cooldownHours' | 'rewardXp' | 'rewardGold', value: number) {
  errorMsg.value = "";
  try {
    const updated = await updatePoiDifficulty(d.id, { [field]: value });
    const idx = difficulties.value.findIndex((x) => x.id === d.id);
    if (idx >= 0) difficulties.value[idx] = updated;
  } catch (e: any) {
    errorMsg.value = e.message;
  }
}

async function updateLootField(d: PoiDifficultyRecord, resource: string, field: 'chance' | 'min' | 'max', value: number) {
  errorMsg.value = "";
  try {
    const newLootTable = { ...d.lootTable };
    newLootTable[resource] = {
      chance: d.lootTable[resource]?.chance ?? 0,
      min: d.lootTable[resource]?.min ?? 0,
      max: d.lootTable[resource]?.max ?? 0,
      [field]: value,
    };
    const updated = await updatePoiDifficulty(d.id, { lootTable: newLootTable });
    const idx = difficulties.value.findIndex((x) => x.id === d.id);
    if (idx >= 0) difficulties.value[idx] = updated;
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

onMounted(async () => {
  fetchTypes();
  fetchDifficulties();
  try {
    const cfg = await fetchGameConfig();
    if (cfg.resourceTypes?.length > 0) {
      resourceSlugs.value = cfg.resourceTypes.map((r: any) => r.slug);
    }
  } catch { /* use default fallback */ }
});
</script>
