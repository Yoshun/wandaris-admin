export type PoiType =
  | "castle"
  | "church"
  | "ruin"
  | "fort"
  | "manor"
  | "archaeological_site"
  | "tower"
  | "city_gate"
  | "summit"
  | "viewpoint"
  | "waterfall"
  | "cave"
  | "cliff"
  | "arch"
  | "hot_spring"
  | "volcano"
  | "glacier"
  | "lake"
  | "bridge"
  | "garden"
  | "square"
  | "megalith"
  | "rock"
  | "windmill"
  | "lighthouse"
  | "water_mill"
  | "aqueduct"
  | "geological";

export const POI_TYPES: PoiType[] = [
  "castle",
  "church",
  "ruin",
  "fort",
  "manor",
  "archaeological_site",
  "tower",
  "city_gate",
  "summit",
  "viewpoint",
  "waterfall",
  "cave",
  "cliff",
  "arch",
  "hot_spring",
  "volcano",
  "glacier",
  "lake",
  "bridge",
  "garden",
  "square",
  "megalith",
  "rock",
  "windmill",
  "lighthouse",
  "water_mill",
  "aqueduct",
  "geological",
];

export type PoiDifficulty = "easy" | "medium" | "hard" | "very_hard";

export const POI_DIFFICULTIES: PoiDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "very_hard",
];

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
