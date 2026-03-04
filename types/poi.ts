export type PoiType = string;
export type PoiDifficulty = string;

export interface PoiTypeRecord {
  id: number;
  slug: string;
  position: number;
}

export interface PoiDifficultyRecord {
  id: number;
  slug: string;
  position: number;
}

export interface PoiDefinition {
  id: number;
  name: string;
  type: PoiType;
  difficulty: PoiDifficulty;
  lat: number;
  lon: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePoiInput {
  name: string;
  type: PoiType;
  difficulty: PoiDifficulty;
  lat: number;
  lon: number;
}

export interface UpdatePoiInput {
  name?: string;
  type?: PoiType;
  difficulty?: PoiDifficulty;
  lat?: number;
  lon?: number;
}

export interface StagedPoi {
  id: number;
  osmId: string;
  name: string;
  type: string;
  difficulty: string;
  lat: number;
  lon: number;
  osmTags?: string;
  importedAt?: string;
}

export interface ImportResult {
  total: number;
  inserted: number;
  skipped: number;
}

export interface ImportZone {
  id: number;
  lat: number;
  lon: number;
  radiusM: number;
  poisFound: number;
  poisInserted: number;
  importedAt?: string;
}
