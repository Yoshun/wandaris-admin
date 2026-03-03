import type { PoiDefinition, CreatePoiInput, UpdatePoiInput, StagedPoi, ImportResult, ImportZone } from "~~/types/poi";

export function useApi() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const { token, logout } = useAuth();

  async function apiFetch<T>(path: string, fetchOptions?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (fetchOptions?.body) headers["Content-Type"] = "application/json";
    if (token.value) headers["Authorization"] = `Bearer ${token.value}`;
    const res = await fetch(`${apiBase}${path}`, {
      headers,
      ...fetchOptions,
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

  return {
    listPois, getPoi, createPoi, updatePoi, deletePoi,
    importOverpass, listStaging, updateStaging, approveStaged, rejectStaged, approveAllStaged,
    listImportZones,
    listUsers, createUser, updateUser, updateUserPermissions, deleteUser,
  };
}
