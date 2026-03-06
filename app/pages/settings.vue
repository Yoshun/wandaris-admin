<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">Gameplay Settings</h1>

    <p v-if="errorMsg" class="text-error mb-4">{{ errorMsg }}</p>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else>
      <div v-for="category in categories" :key="category" class="mb-6">
        <h2 class="text-lg font-bold text-primary mb-3 capitalize">{{ categoryLabels[category] ?? category }}</h2>

        <div class="space-y-1">
          <div
            v-for="s in settingsByCategory[category]"
            :key="s.id"
            class="grid grid-cols-12 gap-2 items-center bg-elevated border border-default rounded px-3 py-2"
          >
            <span class="col-span-3 font-mono text-muted truncate" :title="s.key">{{ s.key }}</span>
            <span class="col-span-5 text-dimmed truncate" :title="s.description ?? ''">{{ s.description ?? '' }}</span>
            <UInput
              type="number"
              :model-value="s.value"
              @update:model-value="s.value = Number($event)"
              size="sm"
              step="any"
              class="col-span-2"
            />
            <div class="col-span-2">
              <UButton size="sm" @click="save(s)" :loading="savingId === s.id">Sauver</UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameSettingRecord } from "~~/types/poi";

const { listGameSettings, updateGameSetting } = useApi();

const errorMsg = ref("");
const loading = ref(true);
const savingId = ref<number | null>(null);

const allSettings = ref<GameSettingRecord[]>([]);

const categoryLabels: Record<string, string> = {
  monster_spawn: "Spawn monstres",
  resource_spawn: "Spawn ressources",
  combat: "Combat",
  monster_scaling: "Scaling monstres",
  combat_tiers: "Tiers de combat",
  player_formulas: "Formules joueur",
  combat_rewards: "R\u00E9compenses combat",
  progression: "Progression",
};

const categories = computed(() => {
  const cats = [...new Set(allSettings.value.map((s) => s.category))];
  const order = Object.keys(categoryLabels);
  return cats.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
});

const settingsByCategory = computed(() => {
  const map: Record<string, GameSettingRecord[]> = {};
  for (const s of allSettings.value) {
    if (!map[s.category]) map[s.category] = [];
    map[s.category].push(s);
  }
  return map;
});

async function fetchSettings() {
  loading.value = true;
  try {
    allSettings.value = await listGameSettings();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function save(s: GameSettingRecord) {
  errorMsg.value = "";
  if (s.value == null || isNaN(Number(s.value))) {
    errorMsg.value = `Valeur invalide pour "${s.key}" : doit etre un nombre valide`;
    return;
  }
  savingId.value = s.id;
  try {
    await updateGameSetting(s.id, { value: s.value });
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    savingId.value = null;
  }
}

onMounted(fetchSettings);
</script>
