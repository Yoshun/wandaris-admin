import type { PoiDefinition, CreatePoiInput, UpdatePoiInput, StagedPoi, ImportResult, ImportZone } from "~~/types/poi";

export function useApi() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  async function apiFetch<T>(path: string, fetchOptions?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    if (fetchOptions?.body) headers["Content-Type"] = "application/json";
    const res = await fetch(`${apiBase}${path}`, {
      headers,
      ...fetchOptions,
    });
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

  return {
    listPois, getPoi, createPoi, updatePoi, deletePoi,
    importOverpass, listStaging, updateStaging, approveStaged, rejectStaged, approveAllStaged,
    listImportZones,
  };
}
