<template>
  <div>
    <h1 class="text-2xl font-bold text-primary mb-4">Logs d'activite</h1>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4 items-end">
      <UFormField label="Evenement">
        <USelect
          v-model="filterEvent"
          :items="eventItems"
          class="w-48"
          placeholder="Tous"
        />
      </UFormField>
      <UFormField label="Utilisateur">
        <USelect
          v-model="filterUser"
          :items="userItems"
          class="w-48"
          placeholder="Tous"
        />
      </UFormField>
      <UFormField label="De">
        <UInput v-model="filterFrom" type="date" class="w-40" />
      </UFormField>
      <UFormField label="A">
        <UInput v-model="filterTo" type="date" class="w-40" />
      </UFormField>
      <UButton @click="resetFilters" variant="soft" color="neutral">Reset</UButton>
    </div>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else-if="error" class="text-error">{{ error }}</div>

    <template v-else>
      <div class="text-muted mb-2">{{ total }} log{{ total > 1 ? 's' : '' }} au total</div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-default">
            <tr class="border-b border-default text-left text-muted">
              <th class="py-2 px-3">Date</th>
              <th class="py-2 px-3">Joueur</th>
              <th class="py-2 px-3">Event</th>
              <th class="py-2 px-3">Data</th>
              <th class="py-2 px-3">Device</th>
              <th class="py-2 px-3">Position</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in logList"
              :key="log.id"
              class="border-b border-default hover:bg-elevated"
            >
              <td class="py-2 px-3 whitespace-nowrap text-muted">{{ formatDate(log.createdAt) }}</td>
              <td class="py-2 px-3 whitespace-nowrap">{{ log.userName ?? '—' }}</td>
              <td class="py-2 px-3">
                <UBadge variant="subtle" :color="eventColor(log.event)">
                  {{ log.event }}
                </UBadge>
              </td>
              <td class="py-2 px-3 max-w-80">
                <code
                  v-if="Object.keys(log.data ?? {}).length > 0"
                  class="break-all text-muted"
                >{{ formatJson(log.data) }}</code>
                <span v-else class="text-dimmed">—</span>
              </td>
              <td class="py-2 px-3 max-w-48">
                <span v-if="log.deviceInfo && Object.keys(log.deviceInfo).length > 0" class="text-muted">
                  {{ deviceSummary(log.deviceInfo) }}
                </span>
                <span v-else class="text-dimmed">—</span>
              </td>
              <td class="py-2 px-3 whitespace-nowrap text-muted">
                <template v-if="log.lat != null && log.lon != null">
                  {{ log.lat.toFixed(4) }}, {{ log.lon.toFixed(4) }}
                </template>
                <span v-else class="text-dimmed">—</span>
              </td>
            </tr>
            <tr v-if="logList.length === 0">
              <td colspan="6" class="py-8 text-center text-dimmed">Aucun log</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="flex items-center justify-center gap-2 mt-4">
        <UButton
          size="sm"
          variant="soft"
          color="neutral"
          :disabled="page === 0"
          @click="page--"
        >
          Precedent
        </UButton>
        <span class="text-muted">
          Page {{ page + 1 }} / {{ totalPages }}
        </span>
        <UButton
          size="sm"
          variant="soft"
          color="neutral"
          :disabled="page >= totalPages - 1"
          @click="page++"
        >
          Suivant
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { listLogs, listUsers } = useApi();

interface LogRow {
  id: number;
  userId: number | null;
  userName: string | null;
  event: string;
  data: Record<string, unknown>;
  deviceInfo: Record<string, unknown>;
  lat: number | null;
  lon: number | null;
  createdAt: string;
}

const logList = ref<LogRow[]>([]);
const total = ref(0);
const loading = ref(true);
const error = ref("");
const page = ref(0);
const pageSize = 50;

// Filters
const filterEvent = ref<string | undefined>(undefined);
const filterUser = ref<string | undefined>(undefined);
const filterFrom = ref("");
const filterTo = ref("");

const EVENT_TYPES = [
  "login", "login_failed", "register", "register_failed", "logout",
  "app_start", "poi_visit", "resource_collect", "resource_gather",
  "combat_start", "combat_end", "combat_reward", "game_reset",
];

const eventItems = computed(() =>
  EVENT_TYPES.map((e) => ({ label: e, value: e }))
);

// Users list for filter
const usersList = ref<{ id: number; name: string }[]>([]);

const userItems = computed(() =>
  usersList.value.map((u) => ({ label: u.name, value: String(u.id) }))
);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

function eventColor(event: string): string {
  if (event.includes("failed")) return "error";
  if (event.startsWith("combat")) return "warning";
  if (event.startsWith("login") || event === "register") return "success";
  if (event.startsWith("poi")) return "info";
  if (event.startsWith("resource")) return "secondary";
  return "neutral";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatJson(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

function deviceSummary(info: Record<string, unknown>): string {
  const parts: string[] = [];
  if (info.deviceModel) parts.push(String(info.deviceModel));
  if (info.platform) parts.push(String(info.platform));
  if (info.osVersion) parts.push(`v${info.osVersion}`);
  return parts.join(" · ") || "—";
}

function resetFilters() {
  filterEvent.value = undefined;
  filterUser.value = undefined;
  filterFrom.value = "";
  filterTo.value = "";
  page.value = 0;
}

async function fetchLogs() {
  loading.value = true;
  error.value = "";
  try {
    const params: Record<string, string | number> = {
      limit: pageSize,
      offset: page.value * pageSize,
    };
    if (filterEvent.value) params.event = filterEvent.value;
    if (filterUser.value) params.userId = filterUser.value;
    if (filterFrom.value) params.from = filterFrom.value;
    if (filterTo.value) params.to = new Date(filterTo.value + "T23:59:59").toISOString();

    const result = await listLogs(params as any);
    logList.value = result.logs;
    total.value = result.total;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

// Reload on filter/page change
watch([filterEvent, filterUser, filterFrom, filterTo], () => {
  if (page.value === 0) {
    fetchLogs(); // page didn't change, fetch directly
  } else {
    page.value = 0; // will trigger the page watcher
  }
});

watch(page, () => fetchLogs());

onMounted(async () => {
  try {
    const users = await listUsers();
    usersList.value = users.map((u: any) => ({ id: u.id, name: u.name }));
  } catch {
    // silently ignore — users dropdown just won't populate
  }
  fetchLogs();
});
</script>
