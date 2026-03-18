<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Couverture par département" icon="i-lucide-map-pin">
        <template #right>
          <UButton icon="i-lucide-copy" variant="soft" @click="copyForDiscord" :disabled="!coverageData">
            Copier pour Discord
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton class="h-8 w-48" />
        <USkeleton class="h-3 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>
      <div v-else-if="errorMsg" class="text-error p-4">{{ errorMsg }}</div>

      <div v-else-if="coverageData" class="p-4">
        <!-- Stats cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div class="bg-elevated border border-default rounded-lg p-4">
            <span class="text-3xl font-bold text-primary">{{ coverageData.overall }}%</span>
            <p class="text-muted text-sm mt-1">Couverture nationale</p>
          </div>
          <div class="bg-elevated border border-default rounded-lg p-4">
            <span class="text-3xl font-bold text-primary">{{ coverageData.departmentsStarted }}</span>
            <span class="text-muted text-lg"> / {{ coverageData.totalDepartments }}</span>
            <p class="text-muted text-sm mt-1">Départements commencés</p>
          </div>
        </div>

        <div class="w-full h-3 bg-default rounded-full overflow-hidden border border-default mb-6">
          <div
            class="h-full rounded-full transition-all duration-700 bg-primary"
            :style="{ width: coverageData.overall + '%' }"
          />
        </div>

        <!-- Dept list sorted by code -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          <div
            v-for="dept in sortedDepts"
            :key="dept.code"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-elevated border border-default"
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
          Mis à jour le {{ formatDate(coverageData.updatedAt) }}
        </p>
      </div>

      <!-- Copied toast -->
      <div
        v-if="showCopied"
        class="fixed bottom-6 right-6 bg-elevated border border-default rounded-lg px-4 py-2 text-sm shadow-lg"
      >
        Copié dans le presse-papiers !
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
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

const loading = ref(true);
const errorMsg = ref("");
const coverageData = ref<CoverageResponse | null>(null);
const showCopied = ref(false);

const sortedDepts = computed(() => {
  if (!coverageData.value) return [];
  return [...coverageData.value.departments].sort((a, b) => a.code.localeCompare(b.code));
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

function makeProgressBar(pct: number, length = 10): string {
  const filled = Math.round((pct / 100) * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

function copyForDiscord() {
  if (!coverageData.value) return;

  const d = coverageData.value;
  const lines: string[] = [];

  lines.push("## \u2694\uFE0F Wandaris \u2014 Couverture des POI");
  lines.push("");
  lines.push(`**${d.overall}%** couverture nationale \u2014 **${d.departmentsStarted}**/${d.totalDepartments} départements`);
  lines.push(`\`${makeProgressBar(d.overall, 20)}\` ${d.overall}%`);
  lines.push("");

  // Only show departments that have coverage > 0, sorted by code
  const active = [...d.departments]
    .filter((dept) => dept.coverage > 0)
    .sort((a, b) => a.code.localeCompare(b.code));

  if (active.length > 0) {
    lines.push("**Départements actifs :**");
    for (const dept of active) {
      lines.push(`\`${dept.code}\` ${dept.name} \u2014 \`${makeProgressBar(dept.coverage)}\` **${dept.coverage}%**`);
    }
  }

  const remaining = d.totalDepartments - d.departmentsStarted;
  if (remaining > 0) {
    lines.push("");
    lines.push(`*${remaining} départements restants à explorer...*`);
  }

  const text = lines.join("\n");
  navigator.clipboard.writeText(text);

  showCopied.value = true;
  setTimeout(() => { showCopied.value = false; }, 2000);
}

onMounted(async () => {
  try {
    coverageData.value = await listCoverage();
  } catch (e: any) {
    errorMsg.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>
