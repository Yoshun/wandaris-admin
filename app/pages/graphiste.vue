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
          <p class="text-muted">Icônes de l'app</p>
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
          <div class="flex gap-1">
            <UButton
              v-for="t in TABS"
              :key="t.id"
              size="xs"
              :variant="tab === t.id ? 'solid' : 'outline'"
              :color="tab === t.id ? 'primary' : 'neutral'"
              :icon="t.icon"
              @click="tab = t.id"
            >
              {{ t.label }}
            </UButton>
          </div>
          <UButton
            v-if="data?.viewer.kind === 'graphiste'"
            class="ml-auto"
            icon="i-lucide-log-out"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Se déconnecter"
            @click="leave"
          />
          <UButton v-else to="/" class="ml-auto" icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="sm">Panel</UButton>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 space-y-10">
        <p v-if="errorMsg" class="text-error">{{ errorMsg }}</p>

        <div v-if="loading && !data" class="space-y-3">
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-40 w-full" />
        </div>

        <MockScreens v-else-if="data && tab === 'screens'" :data="data" :api-base="apiBase" />

        <template v-else-if="data">
          <!-- Une section par catégorie : le titre, l'avancement, la grille -->
          <section v-for="cat in categories" :key="cat.id">
            <div class="flex items-baseline gap-3 flex-wrap">
              <h2 class="text-xl font-semibold">{{ cat.title }}</h2>
              <span class="text-sm text-muted tabular-nums">{{ cat.done }} / {{ cat.items.length }}</span>
            </div>
            <p v-if="cat.note" class="text-muted text-sm max-w-3xl mt-1">{{ cat.note }}</p>
            <div class="grid gap-3 mt-4" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))">
              <IconCard
                v-for="item in cat.items"
                :key="`${item.category}/${item.slug}`"
                :item="item"
                :api-base="apiBase"
                :can-integrate="data.viewer.canIntegrate"
                @updated="replaceItem"
              />
            </div>
          </section>
        </template>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IconItem, IconsResponse } from "~~/types/poi";

definePageMeta({ layout: false });
useHead({
  title: "Icônes — Wandaris",
  // VT323, la police de l'app, pour les maquettes d'écrans
  link: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=VT323&display=swap" }],
});

const { apiBase, locked, login, logout, list } = useIconsApi();

const TABS = [
  { id: "icons", label: "Icônes", icon: "i-lucide-layout-grid" },
  { id: "screens", label: "Écrans", icon: "i-lucide-smartphone" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const password = ref("");
const loginError = ref("");
const loading = ref(false);
const errorMsg = ref("");
const data = ref<IconsResponse | null>(null);
const tab = ref<Tab>("icons");

/** « Faite » = un fichier du graphiste existe, dans l'app ou pas encore. */
const categories = computed(() =>
  (data.value?.categories ?? []).map((cat) => ({
    ...cat,
    done: cat.items.filter((i) => i.status === "delivered" || i.status === "integrated").length,
  })),
);

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
