<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-6">Couverture par departement</h1>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else-if="errorMsg" class="text-error">{{ errorMsg }}</div>

    <template v-else-if="coverageData">
      <!-- Stats -->
      <div class="flex items-center gap-6 mb-4">
        <div>
          <span class="text-3xl font-bold text-primary">{{ coverageData.overall }}%</span>
          <span class="text-muted text-sm ml-2">couverture nationale</span>
        </div>
        <div class="text-sm text-muted">
          {{ coverageData.departmentsStarted }} / {{ coverageData.totalDepartments }} departements commences
        </div>
      </div>
      <div class="w-full h-3 bg-default rounded-full overflow-hidden border border-default mb-6">
        <div
          class="h-full rounded-full transition-all duration-700 bg-primary"
          :style="{ width: coverageData.overall + '%' }"
        />
      </div>

      <!-- Map -->
      <div class="mb-6">
        <ClientOnly>
          <div ref="mapEl" class="w-full rounded-lg overflow-hidden border border-default" style="height: 480px;" />
        </ClientOnly>
      </div>

      <!-- Dept list -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        <div
          v-for="dept in sortedDepts"
          :key="dept.code"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded bg-elevated border border-default"
        >
          <span class="text-xs text-muted w-6 text-right font-mono">{{ dept.code }}</span>
          <span class="text-sm flex-1 truncate">{{ dept.name }}</span>
          <div class="w-20 h-2 bg-default rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              :style="{ width: Math.max(dept.coverage, dept.coverage > 0 ? 3 : 0) + '%', background: getCoverageColor(dept.coverage) }"
            />
          </div>
          <span class="text-xs font-mono w-12 text-right" :style="{ color: getCoverageColor(dept.coverage) }">
            {{ dept.coverage }}%
          </span>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-dimmed text-xs mt-4 text-center">
        Mis a jour le {{ formatDate(coverageData.updatedAt) }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

interface DeptCoverage {
  code: string;
  name: string;
  coverage: number;
}

interface CoverageResponse {
  departments: DeptCoverage[];
  overall: number;
  totalDepartments: number;
  departmentsStarted: number;
  updatedAt: string;
}

const { listCoverage } = useApi();
const colorMode = useColorMode();

const loading = ref(true);
const errorMsg = ref("");
const coverageData = ref<CoverageResponse | null>(null);
const mapEl = ref<HTMLDivElement>();
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;

const sortedDepts = computed(() => {
  if (!coverageData.value) return [];
  return [...coverageData.value.departments].sort((a, b) => b.coverage - a.coverage);
});

function getCoverageColor(pct: number): string {
  if (pct <= 0) return "#6b7280";
  if (pct < 5) return "#b45309";
  if (pct < 15) return "#ca8a04";
  if (pct < 30) return "#eab308";
  if (pct < 50) return "#84cc16";
  if (pct < 75) return "#22c55e";
  return "#16a34a";
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTileUrl() {
  const { maptilerKey } = useRuntimeConfig().public;
  const style = colorMode.value === "dark" ? "topo-v2-dark" : "topo-v2";
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${maptilerKey}`;
}

function initMap(geoJSON: any) {
  if (!mapEl.value) return;

  map = L.map(mapEl.value, { zoomControl: true, attributionControl: false }).setView([46.6, 2.5], 6);

  tileLayer = L.tileLayer(getTileUrl(), {
    tileSize: 512,
    zoomOffset: -1,
  }).addTo(map);

  const coverageMap = new Map<string, number>();
  if (coverageData.value) {
    for (const dept of coverageData.value.departments) {
      coverageMap.set(dept.code, dept.coverage);
    }
  }

  L.geoJSON(geoJSON, {
    style: (feature) => {
      const code = feature?.properties?.code ?? "";
      const cov = coverageMap.get(code) ?? 0;
      return {
        fillColor: getCoverageColor(cov),
        fillOpacity: cov > 0 ? 0.55 : 0.15,
        color: colorMode.value === "dark" ? "#6b7280" : "#9ca3af",
        weight: 1,
      };
    },
    onEachFeature: (feature, layer) => {
      const code = feature.properties?.code ?? "";
      const name = feature.properties?.nom ?? "";
      const cov = coverageMap.get(code) ?? 0;
      layer.bindTooltip(`<b>${code} — ${name}</b><br>${cov}%`, { sticky: true });
    },
  }).addTo(map);
}

watch(() => colorMode.value, () => {
  if (tileLayer) tileLayer.setUrl(getTileUrl());
});

onMounted(async () => {
  try {
    const [coverage, geo] = await Promise.all([
      listCoverage(),
      fetch(GEOJSON_URL).then((r) => {
        if (!r.ok) throw new Error("Erreur GeoJSON");
        return r.json();
      }),
    ]);
    coverageData.value = coverage;
    await nextTick();
    initMap(geo);
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
