<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Gameplay Settings" icon="i-lucide-sliders-horizontal" />
    </template>

    <template #body>
      <p v-if="errorMsg" class="text-error p-4">{{ errorMsg }}</p>

      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-3/4" />
      </div>
      <div v-else class="p-4 space-y-6">
        <div
          v-for="category in categories"
          :key="category"
          class="bg-elevated border border-default rounded-lg overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-default">
            <h2 class="text-lg font-bold text-primary capitalize">{{ categoryLabels[category] ?? category }}</h2>
          </div>
          <div class="p-4 space-y-1">
            <div
              v-for="s in settingsByCategory[category]"
              :key="s.id"
              class="grid grid-cols-12 gap-2 items-center px-3 py-2"
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
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { GameSettingRecord } from "~~/types/poi";

const { listGameSettings, updateGameSetting } = useApi();

const errorMsg = ref("");
const loading = ref(true);
const savingId = ref<number | null>(null);

const allSettings = ref<GameSettingRecord[]>([]);

const categoryLabels: Record<string, string> = {
  spawn: "Spawns",
  combat: "Combat",
  monster_scaling: "Scaling monstres",
  combat_tiers: "Tiers de combat",
  player_formulas: "Formules joueur",
  combat_rewards: "Récompenses combat",
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
    map[s.category]!.push(s);
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
