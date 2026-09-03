<template>
  <div class="min-h-screen bg-neutral-950">
    <!-- Porte : mot de passe dédié, sans compte -->
    <div v-if="locked" class="min-h-screen flex items-center justify-center">
      <div class="w-full max-w-sm space-y-6 p-8 bg-elevated rounded-xl border border-default">
        <div class="text-center space-y-2">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-lucide-compass" class="text-primary text-2xl" />
            <h1 class="text-2xl font-bold text-primary">Wandaris</h1>
          </div>
          <p class="text-muted">Dépôt des icônes</p>
        </div>

        <form class="space-y-4" @submit.prevent="unlock">
          <UFormField label="Mot de passe">
            <UInput v-model="password" type="password" placeholder="••••••••" autofocus class="w-full" />
          </UFormField>
          <p v-if="loginError" class="text-error">{{ loginError }}</p>
          <UButton type="submit" block :loading="loading">Entrer</UButton>
        </form>
      </div>
    </div>

    <template v-else>
      <header class="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur border-b border-default">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-compass" class="text-primary text-xl" />
            <span class="font-bold text-primary">Wandaris</span>
            <span class="text-muted">— Icônes de l'app</span>
          </div>
          <div class="flex gap-1 ml-auto">
            <UButton
              v-for="f in FILTERS"
              :key="f.id"
              size="xs"
              :variant="filter === f.id ? 'solid' : 'ghost'"
              :color="filter === f.id ? 'primary' : 'neutral'"
              @click="filter = f.id"
            >
              {{ f.label }}
            </UButton>
          </div>
          <UButton
            v-if="data?.viewer.kind === 'graphiste'"
            icon="i-lucide-log-out"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Se déconnecter"
            @click="leave"
          />
          <UButton v-else to="/" icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="sm">Panel</UButton>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 space-y-10">
        <p v-if="errorMsg" class="text-error">{{ errorMsg }}</p>

        <div v-if="loading && !data" class="space-y-3">
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-40 w-full" />
        </div>

        <template v-else-if="data">
          <!-- Compteurs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="t in tally" :key="t.label" class="bg-elevated border border-default rounded-lg px-4 py-3">
              <div class="text-3xl font-bold tabular-nums" :class="t.class">{{ t.value }}</div>
              <div class="text-xs uppercase tracking-wide text-muted">{{ t.label }}</div>
            </div>
          </div>

          <!-- Mode d'emploi -->
          <div class="bg-elevated border border-default rounded-lg p-4 text-sm space-y-3">
            <p>
              Chaque case est une icône attendue par l'app. Glissez un PNG dessus, ou cliquez sur
              <strong>Déposer</strong>. Le fichier remplace la version affichée et passe en
              <UBadge color="warning" variant="subtle" size="sm">Déposée, à intégrer</UBadge> ;
              il bascule en <UBadge color="success" variant="subtle" size="sm">Dans l'app</UBadge>
              une fois embarqué dans la prochaine version mobile. Les cases
              <UBadge color="error" variant="subtle" size="sm">Provisoire</UBadge> montrent le
              vecteur qui tient la place aujourd'hui — le sujet, pas le style.
            </p>
            <dl class="grid sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-muted">
              <template v-for="(label, key) in data.formats" :key="key">
                <dt class="font-medium text-default">{{ FORMAT_NAMES[key] ?? key }}</dt>
                <dd>{{ label }}</dd>
              </template>
            </dl>
            <p class="text-dimmed">
              Priorité : identité, puis monstres, puis lieux, puis équipement et consommables, puis les petites icônes d'interface.
            </p>
          </div>

          <!-- Catégories -->
          <section v-for="cat in visibleCategories" :key="cat.id">
            <div class="flex items-baseline gap-3 flex-wrap">
              <h2 class="text-xl font-semibold">{{ cat.title }}</h2>
              <UBadge :color="cat.todo === 0 ? 'success' : 'error'" variant="subtle" size="sm">
                {{ cat.todo === 0 ? `${cat.items.length} · complet` : `${cat.todo} / ${cat.items.length} à faire` }}
              </UBadge>
            </div>
            <p class="text-muted text-sm max-w-3xl mt-1">{{ cat.note }}</p>
            <p class="text-dimmed text-xs max-w-3xl mt-1">{{ data.formats[cat.format] }}</p>
            <div class="grid gap-3 mt-4" style="grid-template-columns: repeat(auto-fill, minmax(170px, 1fr))">
              <IconCard
                v-for="item in cat.shown"
                :key="`${item.category}/${item.slug}`"
                :item="item"
                :api-base="apiBase"
                :can-integrate="data.viewer.canIntegrate"
                @updated="replaceItem"
              />
            </div>
          </section>

          <p v-if="visibleCategories.length === 0" class="text-muted">Rien dans ce filtre.</p>
        </template>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IconItem, IconsResponse } from "~~/types/poi";

definePageMeta({ layout: false });
useHead({ title: "Icônes — Wandaris" });

const { apiBase, locked, login, logout, list } = useIconsApi();

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "todo", label: "À faire" },
  { id: "delivered", label: "Déposées" },
  { id: "done", label: "Dans l'app" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

const FORMAT_NAMES: Record<string, string> = {
  icon: "Icône",
  sprite: "Personnage",
  appicon: "Icône d'app",
  splash: "Splash",
  logo: "Logo",
};

const password = ref("");
const loginError = ref("");
const loading = ref(false);
const errorMsg = ref("");
const data = ref<IconsResponse | null>(null);
const filter = ref<Filter>("all");

function matches(item: IconItem): boolean {
  switch (filter.value) {
    case "todo": return item.status === "placeholder" || item.status === "missing" || item.status === "generated";
    case "delivered": return item.status === "delivered";
    case "done": return item.status === "integrated";
    default: return true;
  }
}

const visibleCategories = computed(() => {
  if (!data.value) return [];
  return data.value.categories
    .map((cat) => ({
      ...cat,
      todo: cat.items.filter((i) => i.status === "placeholder" || i.status === "missing" || i.status === "generated").length,
      shown: cat.items.filter(matches),
    }))
    .filter((cat) => cat.shown.length > 0);
});

const tally = computed(() => {
  const c = data.value?.counts;
  if (!c) return [];
  return [
    { label: "Dans l'app", value: c.integrated, class: "text-success" },
    { label: "Déposées, à intégrer", value: c.delivered, class: "text-warning" },
    { label: "Provisoires, à refaire", value: c.placeholder + c.generated, class: "text-error" },
    { label: "À créer", value: c.missing, class: "text-muted" },
  ];
});

async function load() {
  loading.value = true;
  errorMsg.value = "";
  try {
    data.value = await list();
  } catch (err: any) {
    if (!locked.value) errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function unlock() {
  loginError.value = "";
  loading.value = true;
  try {
    await login(password.value);
    password.value = "";
    await load();
  } catch (err: any) {
    loginError.value = err.message ?? "Erreur de connexion";
  } finally {
    loading.value = false;
  }
}

async function leave() {
  await logout();
  data.value = null;
}

function replaceItem(updated: IconItem) {
  if (!data.value) return;
  const cat = data.value.categories.find((c) => c.id === updated.category);
  const idx = cat?.items.findIndex((i) => i.slug === updated.slug) ?? -1;
  if (!cat || idx < 0) return;
  const previous = cat.items[idx]!;
  cat.items[idx] = updated;
  data.value.counts[previous.status] -= 1;
  data.value.counts[updated.status] += 1;
}

onMounted(load);
</script>
