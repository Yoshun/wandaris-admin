import type { PoiDefinition, CreatePoiInput, UpdatePoiInput, StagedPoi, ImportResult, ImportZone, PoiTypeRecord, PoiDifficultyRecord, BiomeResourceWeightRecord, BiomeMonsterWeightRecord, MonsterTemplateRecord, GameSettingRecord, ItemTemplateRecord, RecipeRecord, ProfessionRecord, PoiReportRecord, PoiSubmissionRecord } from "~~/types/poi";

export function useApi() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const { token, logout } = useAuth();

  async function apiFetch<T>(path: string, fetchOptions?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (fetchOptions?.body) headers["Content-Type"] = "application/json";
    if (token.value) headers["Authorization"] = `Bearer ${token.value}`;
    const res = await fetch(`${apiBase}${path}`, {
      ...fetchOptions,
      headers: { ...headers, ...(fetchOptions?.headers as Record<string, string> ?? {}) },
    });
    if (res.status === 401) {
      logout();
      throw new Error("Session expired");
    }
    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Forbidden");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `API error ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // --- POIs ---
  async function listPois(): Promise<PoiDefinition[]> {
    return apiFetch<PoiDefinition[]>("/api/pois");
  }

  async function getPoi(id: number): Promise<PoiDefinition> {
    return apiFetch<PoiDefinition>(`/api/pois/${id}`);
  }

  async function createPoi(input: CreatePoiInput): Promise<PoiDefinition> {
    return apiFetch<PoiDefinition>("/api/pois", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async function updatePoi(id: number, input: UpdatePoiInput): Promise<PoiDefinition> {
    return apiFetch<PoiDefinition>(`/api/pois/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async function deletePoi(id: number): Promise<void> {
    return apiFetch<void>(`/api/pois/${id}`, { method: "DELETE" });
  }

  // --- Import / Staging ---
  async function importOverpass(lat: number, lon: number, radius: number): Promise<ImportResult> {
    return apiFetch<ImportResult>("/api/import/overpass", {
      method: "POST",
      body: JSON.stringify({ lat, lon, radius }),
    });
  }

  async function listStaging(): Promise<StagedPoi[]> {
    return apiFetch<StagedPoi[]>("/api/import/staging");
  }

  async function updateStaging(id: number, data: { name?: string; type?: string; difficulty?: string }): Promise<StagedPoi> {
    return apiFetch<StagedPoi>(`/api/import/staging/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function approveStaged(id: number): Promise<PoiDefinition> {
    return apiFetch<PoiDefinition>(`/api/import/staging/${id}/approve`, { method: "POST" });
  }

  async function rejectStaged(id: number): Promise<void> {
    return apiFetch<void>(`/api/import/staging/${id}/reject`, { method: "POST" });
  }

  async function approveAllStaged(): Promise<{ approved: number }> {
    return apiFetch<{ approved: number }>("/api/import/staging/approve-all", { method: "POST" });
  }

  async function listImportZones(): Promise<ImportZone[]> {
    return apiFetch<ImportZone[]>("/api/import/zones");
  }

  // --- POI Types ---
  async function listPoiTypes(): Promise<PoiTypeRecord[]> {
    return apiFetch<PoiTypeRecord[]>("/api/poi-types");
  }

  async function createPoiType(data: { slug: string; position?: number; biome?: string }): Promise<PoiTypeRecord> {
    return apiFetch<PoiTypeRecord>("/api/poi-types", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updatePoiType(id: number, data: { slug?: string; position?: number; biome?: string }): Promise<PoiTypeRecord> {
    return apiFetch<PoiTypeRecord>(`/api/poi-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deletePoiType(id: number): Promise<void> {
    return apiFetch<void>(`/api/poi-types/${id}`, { method: "DELETE" });
  }

  // --- POI Difficulties ---
  async function listPoiDifficulties(): Promise<PoiDifficultyRecord[]> {
    return apiFetch<PoiDifficultyRecord[]>("/api/poi-difficulties");
  }

  async function createPoiDifficulty(data: { slug: string; position?: number; cooldownHours?: number; rewardXp?: number; rewardGold?: number; lootTable?: Record<string, { chance: number; min: number; max: number }> }): Promise<PoiDifficultyRecord> {
    return apiFetch<PoiDifficultyRecord>("/api/poi-difficulties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updatePoiDifficulty(id: number, data: { slug?: string; position?: number; cooldownHours?: number; rewardXp?: number; rewardGold?: number; lootTable?: Record<string, { chance: number; min: number; max: number }> }): Promise<PoiDifficultyRecord> {
    return apiFetch<PoiDifficultyRecord>(`/api/poi-difficulties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deletePoiDifficulty(id: number): Promise<void> {
    return apiFetch<void>(`/api/poi-difficulties/${id}`, { method: "DELETE" });
  }

  // --- Users ---
  interface ApiUser {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    permissions: string[];
  }

  async function listUsers(): Promise<ApiUser[]> {
    return apiFetch<ApiUser[]>("/api/users");
  }

  async function createUser(data: { email: string; password: string; name: string; permissions: string[] }): Promise<ApiUser> {
    return apiFetch<ApiUser>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updateUser(id: number, data: { email?: string; name?: string; password?: string }): Promise<ApiUser> {
    return apiFetch<ApiUser>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function updateUserPermissions(id: number, permissions: string[]): Promise<{ userId: number; permissions: string[] }> {
    return apiFetch<{ userId: number; permissions: string[] }>(`/api/users/${id}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    });
  }

  async function deleteUser(id: number): Promise<void> {
    return apiFetch<void>(`/api/users/${id}`, { method: "DELETE" });
  }

  // --- Logs ---
  interface LogEntry {
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

  interface LogsResponse {
    logs: LogEntry[];
    total: number;
  }

  async function listLogs(params: { event?: string; userId?: string; from?: string; to?: string; limit?: number; offset?: number } = {}): Promise<LogsResponse> {
    const qs = new URLSearchParams();
    if (params.event) qs.set("event", params.event);
    if (params.userId) qs.set("userId", params.userId);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.offset) qs.set("offset", String(params.offset));
    const query = qs.toString();
    return apiFetch<LogsResponse>(`/api/logs${query ? `?${query}` : ""}`);
  }

  // --- Biome Weights ---
  let gameConfigCache: { promise: Promise<any>; ts: number } | null = null;

  function fetchGameConfig(): Promise<any> {
    const now = Date.now();
    if (gameConfigCache && now - gameConfigCache.ts < 5000) {
      return gameConfigCache.promise;
    }
    const promise = apiFetch<any>("/api/game-config");
    gameConfigCache = { promise, ts: now };
    // Clear cache after 5s
    setTimeout(() => { gameConfigCache = null; }, 5000);
    return promise;
  }

  async function listBiomeResourceWeights(): Promise<BiomeResourceWeightRecord[]> {
    const cfg = await fetchGameConfig();
    return Object.entries(cfg.biomeResourceWeights).map(([biome, w]: [string, any], i) => ({
      id: i + 1, biome, wood: w.wood, ore: w.ore, fabric: w.fabric, herbs: w.herbs,
    }));
  }

  async function updateBiomeResourceWeights(biome: string, data: { wood: number; ore: number; fabric: number; herbs: number }): Promise<BiomeResourceWeightRecord> {
    gameConfigCache = null;
    return apiFetch<BiomeResourceWeightRecord>(`/api/biome-resource-weights/${biome}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function listBiomeMonsterWeights(): Promise<BiomeMonsterWeightRecord[]> {
    const cfg = await fetchGameConfig();
    return Object.entries(cfg.biomeMonsterWeights).map(([biome, weights]: [string, any], i) => ({
      id: i + 1, biome, weights,
    }));
  }

  async function updateBiomeMonsterWeights(biome: string, data: { weights: Record<string, number> }): Promise<BiomeMonsterWeightRecord> {
    gameConfigCache = null;
    return apiFetch<BiomeMonsterWeightRecord>(`/api/biome-monster-weights/${biome}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- Monster Templates ---
  async function listMonsterTemplates(): Promise<MonsterTemplateRecord[]> {
    return apiFetch<MonsterTemplateRecord[]>("/api/monster-templates");
  }

  async function createMonsterTemplate(data: Omit<MonsterTemplateRecord, "id">): Promise<MonsterTemplateRecord> {
    return apiFetch<MonsterTemplateRecord>("/api/monster-templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updateMonsterTemplate(id: number, data: Partial<Omit<MonsterTemplateRecord, "id">>): Promise<MonsterTemplateRecord> {
    return apiFetch<MonsterTemplateRecord>(`/api/monster-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deleteMonsterTemplate(id: number): Promise<void> {
    return apiFetch<void>(`/api/monster-templates/${id}`, { method: "DELETE" });
  }

  // --- Game Settings ---
  async function listGameSettings(): Promise<GameSettingRecord[]> {
    return apiFetch<GameSettingRecord[]>("/api/game-settings");
  }

  async function updateGameSetting(id: number, data: { value: number }): Promise<GameSettingRecord> {
    return apiFetch<GameSettingRecord>(`/api/game-settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- Item Templates ---
  async function listItemTemplates(): Promise<ItemTemplateRecord[]> {
    return apiFetch<ItemTemplateRecord[]>("/api/item-templates");
  }

  async function createItemTemplate(data: Omit<ItemTemplateRecord, "id">): Promise<ItemTemplateRecord> {
    return apiFetch<ItemTemplateRecord>("/api/item-templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updateItemTemplate(id: number, data: Partial<Omit<ItemTemplateRecord, "id">>): Promise<ItemTemplateRecord> {
    return apiFetch<ItemTemplateRecord>(`/api/item-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deleteItemTemplate(id: number): Promise<void> {
    return apiFetch<void>(`/api/item-templates/${id}`, { method: "DELETE" });
  }

  // --- Recipes ---
  async function listRecipes(): Promise<RecipeRecord[]> {
    return apiFetch<RecipeRecord[]>("/api/recipes/all");
  }

  async function createRecipe(data: { itemTemplateId: number; ingredients: Record<string, number>; quantity?: number; known?: boolean }): Promise<RecipeRecord> {
    return apiFetch<RecipeRecord>("/api/recipes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function updateRecipe(id: number, data: { ingredients?: Record<string, number>; quantity?: number; known?: boolean }): Promise<RecipeRecord> {
    return apiFetch<RecipeRecord>(`/api/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async function deleteRecipe(id: number): Promise<void> {
    return apiFetch<void>(`/api/recipes/${id}`, { method: "DELETE" });
  }

  // --- Professions ---
  async function listProfessions(): Promise<ProfessionRecord[]> {
    return apiFetch<ProfessionRecord[]>("/api/professions/all");
  }

  // --- POI Reports ---
  async function listPoiReports(): Promise<PoiReportRecord[]> {
    return apiFetch<PoiReportRecord[]>("/api/poi-reports");
  }

  async function updatePoiReport(id: number, data: { status: string; adminResponse?: string }): Promise<PoiReportRecord> {
    return apiFetch<PoiReportRecord>(`/api/poi-reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // --- POI Submissions ---
  async function listPoiSubmissions(): Promise<PoiSubmissionRecord[]> {
    return apiFetch<PoiSubmissionRecord[]>("/api/poi-submissions");
  }

  async function updatePoiSubmission(id: number, data: { status: string; rejectReason?: string }): Promise<PoiSubmissionRecord> {
    return apiFetch<PoiSubmissionRecord>(`/api/poi-submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  return {
    listPois, getPoi, createPoi, updatePoi, deletePoi,
    importOverpass, listStaging, updateStaging, approveStaged, rejectStaged, approveAllStaged,
    listImportZones,
    listPoiTypes, createPoiType, updatePoiType, deletePoiType,
    listPoiDifficulties, createPoiDifficulty, updatePoiDifficulty, deletePoiDifficulty,
    listUsers, createUser, updateUser, updateUserPermissions, deleteUser,
    listLogs,
    listBiomeResourceWeights, updateBiomeResourceWeights,
    listBiomeMonsterWeights, updateBiomeMonsterWeights,
    listMonsterTemplates, createMonsterTemplate, updateMonsterTemplate, deleteMonsterTemplate,
    listGameSettings, updateGameSetting,
    listItemTemplates, createItemTemplate, updateItemTemplate, deleteItemTemplate,
    listRecipes, createRecipe, updateRecipe, deleteRecipe,
    listProfessions,
    listPoiReports, updatePoiReport,
    listPoiSubmissions, updatePoiSubmission,
  };
}
