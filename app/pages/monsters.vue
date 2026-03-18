<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">Monstres</h1>

    <p v-if="errorMsg" class="text-error mb-4">{{ errorMsg }}</p>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else>
      <!-- Header -->
      <div class="grid grid-cols-9 gap-2 text-muted font-semibold px-3 mb-1">
        <span>Icône</span>
        <span>Type</span>
        <span>Nom</span>
        <span>HP</span>
        <span>Attaque</span>
        <span>Intervalle (ms)</span>
        <span>Couleur</span>
        <span>Boss</span>
        <span>Actions</span>
      </div>

      <!-- Existing rows -->
      <div
        v-for="t in templates"
        :key="t.id"
        class="grid grid-cols-9 gap-2 items-center bg-elevated border border-default rounded px-3 py-2 mb-1"
      >
        <div>
          <img
            :src="`https://api.wandaris.com/static/monster-icons/monster-${t.type}.png`"
            :alt="t.name"
            class="w-8 h-8 object-contain"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>
        <UInput v-model="t.type" size="sm" />
        <UInput v-model="t.name" size="sm" />
        <UInput type="number" v-model.number="t.baseHp" size="sm" />
        <UInput type="number" v-model.number="t.baseAttack" size="sm" />
        <UInput type="number" v-model.number="t.attackIntervalMs" size="sm" />
        <div class="flex items-center gap-1">
          <input type="color" v-model="t.color" class="w-6 h-6 rounded cursor-pointer" />
          <span class="text-muted">{{ t.color }}</span>
        </div>
        <span class="text-xs" :class="t.bossOnly ? 'text-warning' : 'text-muted'">
          {{ t.bossOnly ? 'Boss' : '—' }}
        </span>
        <div class="flex gap-1">
          <UButton size="sm" @click="save(t)" :loading="savingId === t.id">Sauver</UButton>
          <UButton size="sm" color="error" variant="soft" @click="confirmTarget = t" :loading="deletingId === t.id">Suppr</UButton>
        </div>
      </div>

      <!-- New row -->
      <div class="grid grid-cols-9 gap-2 items-center bg-elevated border border-dashed border-default rounded px-3 py-2 mt-3">
        <div />
        <UInput v-model="newTemplate.type" size="sm" placeholder="type" />
        <UInput v-model="newTemplate.name" size="sm" placeholder="Nom" />
        <UInput type="number" v-model.number="newTemplate.baseHp" size="sm" placeholder="HP" />
        <UInput type="number" v-model.number="newTemplate.baseAttack" size="sm" placeholder="ATK" />
        <UInput type="number" v-model.number="newTemplate.attackIntervalMs" size="sm" placeholder="ms" />
        <div class="flex items-center gap-1">
          <input type="color" v-model="newTemplate.color" class="w-6 h-6 rounded cursor-pointer" />
          <span class="text-muted">{{ newTemplate.color }}</span>
        </div>
        <div />
        <div>
          <UButton size="sm" @click="create" :loading="creating" :disabled="!newTemplate.type?.trim()">Ajouter</UButton>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="!!confirmTarget"
      :message="`Supprimer le monstre \u00AB ${confirmTarget?.name} \u00BB ?`"
      @confirm="confirmDelete"
      @cancel="confirmTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { MonsterTemplateRecord } from "~~/types/poi";

const { listMonsterTemplates, createMonsterTemplate, updateMonsterTemplate, deleteMonsterTemplate } = useApi();

const errorMsg = ref("");
const loading = ref(true);
const savingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const creating = ref(false);

const confirmTarget = ref<MonsterTemplateRecord | null>(null);
const templates = ref<MonsterTemplateRecord[]>([]);

const newTemplate = ref({
  type: "",
  name: "",
  baseHp: 30,
  baseAttack: 5,
  attackIntervalMs: 2000,
  color: "#888888",
});

async function fetchTemplates() {
  loading.value = true;
  try {
    templates.value = await listMonsterTemplates();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
}

function validateNumericFields(hp: number, atk: number, interval: number): string | null {
  if (hp == null || isNaN(hp) || hp < 1) return "HP doit etre >= 1";
  if (atk == null || isNaN(atk) || atk < 1) return "Attaque doit etre >= 1";
  if (interval == null || isNaN(interval) || interval < 1) return "Intervalle doit etre >= 1";
  return null;
}

async function save(t: MonsterTemplateRecord) {
  errorMsg.value = "";
  const err = validateNumericFields(t.baseHp, t.baseAttack, t.attackIntervalMs);
  if (err) { errorMsg.value = err; return; }
  savingId.value = t.id;
  try {
    await updateMonsterTemplate(t.id, {
      type: t.type,
      name: t.name,
      baseHp: t.baseHp,
      baseAttack: t.baseAttack,
      attackIntervalMs: t.attackIntervalMs,
      color: t.color,
    });
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    savingId.value = null;
  }
}

async function remove(t: MonsterTemplateRecord) {
  errorMsg.value = "";
  deletingId.value = t.id;
  try {
    await deleteMonsterTemplate(t.id);
    templates.value = templates.value.filter((x) => x.id !== t.id);
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    deletingId.value = null;
  }
}

async function confirmDelete() {
  if (!confirmTarget.value) return;
  await remove(confirmTarget.value);
  confirmTarget.value = null;
}

async function create() {
  errorMsg.value = "";
  const err = validateNumericFields(newTemplate.value.baseHp, newTemplate.value.baseAttack, newTemplate.value.attackIntervalMs);
  if (err) { errorMsg.value = err; return; }
  creating.value = true;
  try {
    const created = await createMonsterTemplate({
      type: newTemplate.value.type,
      name: newTemplate.value.name,
      baseHp: newTemplate.value.baseHp,
      baseAttack: newTemplate.value.baseAttack,
      attackIntervalMs: newTemplate.value.attackIntervalMs,
      color: newTemplate.value.color,
    });
    templates.value.push(created);
    newTemplate.value = { type: "", name: "", baseHp: 30, baseAttack: 5, attackIntervalMs: 2000, color: "#888888" };
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    creating.value = false;
  }
}

onMounted(fetchTemplates);
</script>
