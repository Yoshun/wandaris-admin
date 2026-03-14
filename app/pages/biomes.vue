<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">Biomes</h1>

    <p v-if="errorMsg" class="text-error mb-4">{{ errorMsg }}</p>

    <!-- Resource Weights -->
    <div class="mb-8">
      <h2 class="text-lg font-bold text-primary mb-3">Poids des ressources par biome</h2>

      <div v-if="loadingResources" class="text-muted">Chargement...</div>
      <div v-else class="space-y-2">
        <div class="grid grid-cols-6 gap-2 text-muted font-semibold px-3">
          <span>Biome</span>
          <span>Wood</span>
          <span>Ore</span>
          <span>Fabric</span>
          <span>Herbs</span>
          <span>Cuir</span>
        </div>
        <div
          v-for="r in resourceWeights"
          :key="r.biome"
          class="grid grid-cols-6 gap-2 items-center bg-elevated border border-default rounded px-3 py-2"
        >
          <span class="font-medium capitalize">{{ r.biome }}</span>
          <UInput
            type="number"
            v-model.number="r.wood"
            size="sm"
          />
          <UInput
            type="number"
            v-model.number="r.ore"
            size="sm"
          />
          <UInput
            type="number"
            v-model.number="r.fabric"
            size="sm"
          />
          <UInput
            type="number"
            v-model.number="r.herbs"
            size="sm"
          />
          <div class="flex gap-1">
            <UInput
              type="number"
              v-model.number="r.leather"
              size="sm"
              class="flex-1"
            />
            <UButton size="sm" @click="saveResourceWeights(r)" :loading="savingResource === r.biome">
              Sauver
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Monster Weights -->
    <div>
      <h2 class="text-lg font-bold text-primary mb-3">Poids des monstres par biome</h2>

      <div v-if="loadingMonsters" class="text-muted">Chargement...</div>
      <div v-else class="space-y-3">
        <div
          v-for="m in monsterWeights"
          :key="m.biome"
          class="bg-elevated border border-default rounded px-3 py-2"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium capitalize">{{ m.biome }}</span>
            <UButton size="sm" @click="saveMonsterWeights(m)" :loading="savingMonster === m.biome">
              Sauver
            </UButton>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <div v-for="(weight, monsterType) in m.weights" :key="monsterType">
              <label class="text-muted capitalize">{{ monsterType }}</label>
              <UInput
                type="number"
                v-model.number="m.weights[monsterType]"
                size="sm"
              />
            </div>
          </div>
          <!-- Add monster type -->
          <div class="flex gap-1 mt-2">
            <UInput v-model="newMonsterKey[m.biome]" placeholder="monster_type" size="sm" class="flex-1" />
            <UInput v-model.number="newMonsterWeight[m.biome]" type="number" placeholder="weight" size="sm" class="w-20" />
            <UButton size="sm" variant="soft" @click="addMonsterEntry(m)" :disabled="!newMonsterKey[m.biome]?.trim()">+</UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BiomeResourceWeightRecord, BiomeMonsterWeightRecord } from "~~/types/poi";

const {
  listBiomeResourceWeights, updateBiomeResourceWeights,
  listBiomeMonsterWeights, updateBiomeMonsterWeights,
} = useApi();

const errorMsg = ref("");
const loadingResources = ref(true);
const loadingMonsters = ref(true);
const savingResource = ref<string | null>(null);
const savingMonster = ref<string | null>(null);

const resourceWeights = ref<BiomeResourceWeightRecord[]>([]);
const monsterWeights = ref<BiomeMonsterWeightRecord[]>([]);

const newMonsterKey = ref<Record<string, string>>({});
const newMonsterWeight = ref<Record<string, number>>({});

async function fetchResourceWeights() {
  loadingResources.value = true;
  try {
    resourceWeights.value = await listBiomeResourceWeights();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loadingResources.value = false;
  }
}

async function fetchMonsterWeights() {
  loadingMonsters.value = true;
  try {
    monsterWeights.value = await listBiomeMonsterWeights();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loadingMonsters.value = false;
  }
}

async function saveResourceWeights(r: BiomeResourceWeightRecord) {
  errorMsg.value = "";
  if ([r.wood, r.ore, r.fabric, r.herbs, r.leather].some((v) => v == null || isNaN(v) || v < 0)) {
    errorMsg.value = "Les poids doivent etre >= 0";
    return;
  }
  savingResource.value = r.biome;
  try {
    await updateBiomeResourceWeights(r.biome, {
      wood: r.wood, ore: r.ore, fabric: r.fabric, herbs: r.herbs, leather: r.leather,
    });
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    savingResource.value = null;
  }
}

async function saveMonsterWeights(m: BiomeMonsterWeightRecord) {
  errorMsg.value = "";
  if (Object.values(m.weights).some((v) => v == null || isNaN(v) || v < 0)) {
    errorMsg.value = "Les poids doivent etre >= 0";
    return;
  }
  savingMonster.value = m.biome;
  try {
    await updateBiomeMonsterWeights(m.biome, { weights: m.weights });
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    savingMonster.value = null;
  }
}

function addMonsterEntry(m: BiomeMonsterWeightRecord) {
  const key = newMonsterKey.value[m.biome]?.trim();
  if (!key) return;
  m.weights[key] = newMonsterWeight.value[m.biome] ?? 10;
  newMonsterKey.value[m.biome] = "";
  newMonsterWeight.value[m.biome] = 0;
}

onMounted(() => {
  fetchResourceWeights();
  fetchMonsterWeights();
});
</script>
