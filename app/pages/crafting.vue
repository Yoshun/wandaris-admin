<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Crafting" icon="i-lucide-hammer">
        <template #right>
          <UButton icon="i-lucide-plus" @click="openCreateModal">Ajouter un item</UButton>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <UTabs :items="professionTabs" v-model="activeTab" />
        </template>
        <template #right>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="t in typeFilters"
              :key="t.value"
              size="xs"
              :variant="typeFilter === t.value ? 'solid' : 'soft'"
              @click="typeFilter = t.value"
            >
              {{ t.label }}
            </UButton>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <p v-if="errorMsg" class="text-error p-4">{{ errorMsg }}</p>

      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-3/4" />
      </div>
      <div v-else class="p-4">
        <!-- Stats -->
        <div class="flex gap-4 mb-4 text-muted">
          <span>{{ filteredItems.length }} items</span>
          <span>{{ filteredRecipes.length }} recettes</span>
        </div>

        <!-- Items table -->
        <UTable :data="paginatedItems" :columns="tableColumns" class="w-full" />

        <!-- Pagination -->
        <div v-if="filteredItems.length > pageSize" class="flex justify-center mt-4">
          <UPagination
            v-model:page="page"
            :total="filteredItems.length"
            :items-per-page="pageSize"
            show-edges
          />
        </div>
      </div>

      <ConfirmDialog
        :visible="!!confirmTarget"
        :message="`Supprimer l'item \u00AB ${confirmTarget?.name} \u00BB ?`"
        @confirm="confirmDelete"
        @cancel="confirmTarget = null"
      />

      <!-- Edit/Create Modal -->
      <UModal v-model:open="modalOpen">
        <template #content>
          <div class="p-6 space-y-5">
            <h2 class="text-xl font-bold text-primary">{{ editingItem ? 'Modifier' : 'Nouvel' }} item</h2>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Slug">
                <UInput v-model="form.slug" />
              </UFormField>
              <UFormField label="Nom">
                <UInput v-model="form.name" />
              </UFormField>
              <UFormField label="Type">
                <USelect v-model="form.type" :items="itemTypeOptions" />
              </UFormField>
              <UFormField label="Slot">
                <USelect :model-value="form.slot ?? undefined" @update:model-value="form.slot = $event ?? null" :items="slotOptions" placeholder="Aucun" />
              </UFormField>
              <UFormField label="Rareté">
                <USelect v-model="form.rarity" :items="rarityOptions" />
              </UFormField>
              <UFormField label="Métier">
                <USelect v-model="form.professionSlug" :items="professionOptions" />
              </UFormField>
              <UFormField label="Niv. joueur requis">
                <UInput type="number" v-model.number="form.requiredLevel" />
              </UFormField>
              <UFormField label="Niv. métier requis">
                <UInput type="number" v-model.number="form.professionLevel" />
              </UFormField>
              <UFormField label="Valeur de vente (or)">
                <UInput type="number" v-model.number="form.sellValue" />
              </UFormField>
              <UFormField v-if="form.type === 'potion_heal'" label="Soin (HP)">
                <UInput type="number" v-model.number="form.healAmount" />
              </UFormField>
              <UFormField v-if="form.type === 'potion_buff'" label="Durée (min)">
                <UInput type="number" v-model.number="form.duration" />
              </UFormField>
            </div>

            <!-- Stats (for equipment) -->
            <UFormField v-if="['weapon', 'armor_heavy', 'armor_light', 'cape'].includes(form.type)" label="Stats (JSON)">
              <UInput v-model="form.statsJson" placeholder='{"force": 3, "endurance": 2}' />
            </UFormField>

            <!-- Effects (for potions) -->
            <UFormField v-if="form.type === 'potion_buff'" label="Effets (JSON)">
              <UInput v-model="form.effectsJson" placeholder='{"atk": 0.15, "gold": 0.2}' />
            </UFormField>

            <!-- Recipe -->
            <UFormField label="Ingredients (JSON)">
              <UInput v-model="form.ingredientsJson" placeholder='{"wood": 3}' />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Quantite produite">
                <UInput type="number" v-model.number="form.quantity" />
              </UFormField>
              <UFormField label="Recette connue">
                <UCheckbox v-model="form.known" class="mt-2" />
              </UFormField>
            </div>

            <div class="flex gap-2 justify-end">
              <UButton variant="soft" @click="modalOpen = false">Annuler</UButton>
              <UButton @click="saveItem" :loading="saving">{{ editingItem ? 'Sauver' : 'Créer' }}</UButton>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { h } from "vue";
import type { ItemTemplateRecord, RecipeRecord, ProfessionRecord } from "~~/types/poi";

const { listItemTemplates, createItemTemplate, updateItemTemplate, deleteItemTemplate, listRecipes, createRecipe, updateRecipe, listProfessions } = useApi();

const errorMsg = ref("");
const loading = ref(true);
const deletingId = ref<number | null>(null);
const confirmTarget = ref<ItemTemplateRecord | null>(null);
const saving = ref(false);
const modalOpen = ref(false);

const items = ref<ItemTemplateRecord[]>([]);
const allRecipes = ref<RecipeRecord[]>([]);
const professionsList = ref<ProfessionRecord[]>([]);

const activeTab = ref("all");
const typeFilter = ref("all");

// Pagination
const page = ref(1);
const pageSize = 50;

// Edit state
const editingItem = ref<ItemTemplateRecord | null>(null);
const editingRecipe = ref<RecipeRecord | null>(null);

const form = ref({
  slug: "",
  name: "",
  type: "weapon",
  slot: null as string | null,
  rarity: "common",
  requiredLevel: 1,
  professionSlug: "forgeron",
  professionLevel: 1,
  healAmount: null as number | null,
  duration: null as number | null,
  sellValue: 0,
  statsJson: "{}",
  effectsJson: "{}",
  ingredientsJson: "{}",
  quantity: 1,
  known: true,
});

// Options
const itemTypeOptions = [
  { label: "Arme", value: "weapon" },
  { label: "Armure lourde", value: "armor_heavy" },
  { label: "Armure legere", value: "armor_light" },
  { label: "Cape", value: "cape" },
  { label: "Materiau", value: "material" },
  { label: "Potion soin", value: "potion_heal" },
  { label: "Potion buff", value: "potion_buff" },
];

const slotOptions = [
  { label: "Tete", value: "head" },
  { label: "Torse", value: "torso" },
  { label: "Jambes", value: "legs" },
  { label: "Mains", value: "hands" },
  { label: "Pieds", value: "feet" },
  { label: "Arme", value: "weapon" },
  { label: "Dos", value: "back" },
];

const rarityOptions = [
  { label: "Commun", value: "common" },
  { label: "Peu commun", value: "uncommon" },
  { label: "Rare", value: "rare" },
  { label: "Épique", value: "epic" },
  { label: "Légendaire", value: "legendary" },
];

const professionOptions = computed(() =>
  professionsList.value.map((p) => ({ label: p.label, value: p.slug }))
);

const professionTabs = computed(() => [
  { label: "Tous", value: "all" },
  ...professionsList.value.map((p) => ({ label: p.label, value: p.slug })),
]);

const typeFilters = [
  { label: "Tous", value: "all" },
  { label: "Materiaux", value: "material" },
  { label: "Armes", value: "weapon" },
  { label: "Armures lourdes", value: "armor_heavy" },
  { label: "Armures legeres", value: "armor_light" },
  { label: "Capes", value: "cape" },
  { label: "Potions soin", value: "potion_heal" },
  { label: "Potions buff", value: "potion_buff" },
];

const filteredItems = computed(() => {
  let result = items.value;
  if (activeTab.value !== "all") {
    result = result.filter((i) => i.professionSlug === activeTab.value);
  }
  if (typeFilter.value !== "all") {
    result = result.filter((i) => i.type === typeFilter.value);
  }
  return result;
});

const paginatedItems = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredItems.value.slice(start, start + pageSize);
});

const filteredRecipes = computed(() => {
  const itemIds = new Set(filteredItems.value.map((i) => i.id));
  return allRecipes.value.filter((r) => itemIds.has(r.itemTemplateId));
});

// Reset page when filters change
watch([() => activeTab.value, () => typeFilter.value], () => {
  page.value = 1;
});

// Table columns
const tableColumns = computed(() => [
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "name", header: "Nom" },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: any) => {
      const item = row.original;
      return h(resolveComponent("UBadge"), { variant: "subtle", color: typeBadgeColor(item.type) }, () => typeLabel(item.type));
    },
  },
  { accessorKey: "slot", header: "Slot", cell: ({ row }: any) => row.original.slot ?? "-" },
  {
    accessorKey: "rarity",
    header: "Rareté",
    cell: ({ row }: any) => {
      const item = row.original;
      return h(resolveComponent("UBadge"), { color: rarityColor(item.rarity) }, () => item.rarity);
    },
  },
  { accessorKey: "requiredLevel", header: "Niv. joueur" },
  { accessorKey: "professionLevel", header: "Niv. métier" },
  {
    id: "stats",
    header: "Stats / Effets",
    cell: ({ row }: any) => formatStatsEffects(row.original),
  },
  {
    id: "recipe",
    header: "Recette",
    cell: ({ row }: any) => formatRecipe(row.original.id),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const item = row.original;
      return h("div", { class: "flex gap-2" }, [
        h(resolveComponent("UButton"), { size: "sm", variant: "soft", onClick: () => editItem(item) }, () => "Edit"),
        h(resolveComponent("UButton"), { size: "sm", variant: "outline", color: "neutral", loading: deletingId.value === item.id, onClick: () => { confirmTarget.value = item; } }, () => "Suppr"),
      ]);
    },
  },
]);

// Helpers
function typeLabel(type: string): string {
  return itemTypeOptions.find((o) => o.value === type)?.label ?? type;
}

function typeBadgeColor(type: string): string {
  const map: Record<string, string> = {
    weapon: "error", armor_heavy: "info", armor_light: "success",
    cape: "secondary", material: "neutral", potion_heal: "warning", potion_buff: "primary",
  };
  return map[type] ?? "neutral";
}

function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: "neutral", uncommon: "success", rare: "info", epic: "secondary", legendary: "warning",
  };
  return map[rarity] ?? "neutral";
}

function formatStatsEffects(item: ItemTemplateRecord): string {
  if (item.healAmount) return `Soin: ${item.healAmount} HP`;
  const stats = Object.entries(item.stats ?? {});
  const effects = Object.entries(item.effects ?? {});
  if (stats.length > 0) return stats.map(([k, v]) => `${k}: +${v}`).join(", ");
  if (effects.length > 0) return effects.map(([k, v]) => `${k}: +${Math.round(v * 100)}%`).join(", ");
  return "-";
}

function formatRecipe(templateId: number): string {
  const recipe = allRecipes.value.find((r) => r.itemTemplateId === templateId);
  if (!recipe) return "-";
  const parts = Object.entries(recipe.ingredients as Record<string, number>)
    .map(([k, v]) => `${v}x ${k}`)
    .join(", ");
  const qty = recipe.quantity > 1 ? ` -> ${recipe.quantity}` : "";
  const discovered = recipe.known ? "" : " [a decouvrir]";
  return `${parts}${qty}${discovered}`;
}

function openCreateModal() {
  editingItem.value = null;
  editingRecipe.value = null;
  form.value = {
    slug: "", name: "", type: "weapon", slot: null, rarity: "common",
    requiredLevel: 1, professionSlug: activeTab.value !== "all" ? activeTab.value : "forgeron",
    professionLevel: 1, healAmount: null, duration: null, sellValue: 0,
    statsJson: "{}", effectsJson: "{}", ingredientsJson: "{}", quantity: 1, known: true,
  };
  modalOpen.value = true;
}

function editItem(item: ItemTemplateRecord) {
  editingItem.value = item;
  editingRecipe.value = allRecipes.value.find((r) => r.itemTemplateId === item.id) ?? null;
  form.value = {
    slug: item.slug,
    name: item.name,
    type: item.type,
    slot: item.slot,
    rarity: item.rarity,
    requiredLevel: item.requiredLevel,
    professionSlug: item.professionSlug,
    professionLevel: item.professionLevel,
    healAmount: item.healAmount,
    duration: item.duration,
    sellValue: item.sellValue ?? 0,
    statsJson: JSON.stringify(item.stats ?? {}),
    effectsJson: JSON.stringify(item.effects ?? {}),
    ingredientsJson: editingRecipe.value ? JSON.stringify(editingRecipe.value.ingredients) : "{}",
    quantity: editingRecipe.value?.quantity ?? 1,
    known: editingRecipe.value?.known ?? true,
  };
  modalOpen.value = true;
}

async function saveItem() {
  errorMsg.value = "";
  saving.value = true;
  try {
    let stats: Record<string, number> = {};
    let effects: Record<string, number> = {};
    let ingredients: Record<string, number> = {};

    try { stats = JSON.parse(form.value.statsJson); } catch { throw new Error("Stats JSON invalide"); }
    try { effects = JSON.parse(form.value.effectsJson); } catch { throw new Error("Effects JSON invalide"); }
    try { ingredients = JSON.parse(form.value.ingredientsJson); } catch { throw new Error("Ingredients JSON invalide"); }

    const templateData = {
      slug: form.value.slug,
      name: form.value.name,
      type: form.value.type,
      slot: form.value.slot,
      rarity: form.value.rarity,
      requiredLevel: form.value.requiredLevel,
      stats,
      effects,
      healAmount: form.value.healAmount,
      duration: form.value.duration,
      professionSlug: form.value.professionSlug,
      professionLevel: form.value.professionLevel,
      sellValue: form.value.sellValue,
    };

    if (editingItem.value) {
      const updated = await updateItemTemplate(editingItem.value.id, templateData);
      const idx = items.value.findIndex((i) => i.id === updated.id);
      if (idx >= 0) items.value[idx] = updated;

      if (editingRecipe.value) {
        await updateRecipe(editingRecipe.value.id, {
          ingredients,
          quantity: form.value.quantity,
          known: form.value.known,
        });
      }
    } else {
      const created = await createItemTemplate(templateData);
      items.value.push(created);

      if (Object.keys(ingredients).length > 0) {
        const recipe = await createRecipe({
          itemTemplateId: created.id,
          ingredients,
          quantity: form.value.quantity,
          known: form.value.known,
        });
        allRecipes.value.push(recipe);
      }
    }

    allRecipes.value = await listRecipes();
    modalOpen.value = false;
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!confirmTarget.value) return;
  await removeItem(confirmTarget.value);
  confirmTarget.value = null;
}

async function removeItem(item: ItemTemplateRecord) {
  errorMsg.value = "";
  deletingId.value = item.id;
  try {
    await deleteItemTemplate(item.id);
    items.value = items.value.filter((i) => i.id !== item.id);
    allRecipes.value = allRecipes.value.filter((r) => r.itemTemplateId !== item.id);
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    deletingId.value = null;
  }
}

async function fetchAll() {
  loading.value = true;
  try {
    const [i, r, p] = await Promise.all([
      listItemTemplates(),
      listRecipes(),
      listProfessions(),
    ]);
    items.value = i;
    allRecipes.value = r;
    professionsList.value = p;
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchAll);
</script>
