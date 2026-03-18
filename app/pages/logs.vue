<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Logs d'activite" icon="i-lucide-scroll-text" />
      <UDashboardToolbar>
        <template #left>
          <div class="flex flex-wrap gap-3 items-end">
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
            <UButton @click="resetFilters" variant="soft" color="neutral" size="sm">Reset</UButton>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>
      <div v-else-if="error" class="text-error p-4">{{ error }}</div>

      <div v-else class="p-4">
        <div class="text-muted mb-3">{{ total }} log{{ total > 1 ? 's' : '' }} au total</div>

        <UTable :data="logList" :columns="tableColumns" class="w-full" />

        <div v-if="logList.length === 0" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
          <p class="text-muted">Aucun log</p>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="flex justify-center mt-4">
          <UPagination
            v-model:page="paginationPage"
            :total="total"
            :items-per-page="pageSize"
            show-edges
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { h } from "vue";

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

// UPagination is 1-based, our API is 0-based
const paginationPage = computed({
  get: () => page.value + 1,
  set: (v: number) => { page.value = v - 1; },
});

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

const tableColumns = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: any) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "userName",
    header: "Joueur",
    cell: ({ row }: any) => row.original.userName ?? "—",
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }: any) => {
      return h(resolveComponent("UBadge"), { variant: "subtle", color: eventColor(row.original.event) }, () => row.original.event);
    },
  },
  {
    id: "data",
    header: "Data",
    cell: ({ row }: any) => {
      const data = row.original.data ?? {};
      if (Object.keys(data).length === 0) return "—";
      return h("code", { class: "break-all text-muted text-xs" }, formatJson(data));
    },
    meta: { class: { td: "max-w-80" } },
  },
  {
    id: "device",
    header: "Device",
    cell: ({ row }: any) => {
      const info = row.original.deviceInfo;
      if (!info || Object.keys(info).length === 0) return "—";
      return deviceSummary(info);
    },
    meta: { class: { td: "max-w-48" } },
  },
  {
    id: "position",
    header: "Position",
    cell: ({ row }: any) => {
      const { lat, lon } = row.original;
      if (lat != null && lon != null) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      return "—";
    },
  },
];

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
