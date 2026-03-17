export type PoiType = string;
export type PoiDifficulty = string;

export interface PoiTypeRecord {
  id: number;
  slug: string;
  position: number;
  biome: string;
}

export interface PoiDifficultyRecord {
  id: number;
  slug: string;
  position: number;
  cooldownHours: number;
  rewardXp: number;
  rewardGold: number;
  lootTable: Record<string, { chance: number; min: number; max: number }>;
}

export interface BiomeResourceWeightRecord {
  id: number;
  biome: string;
  weights: Record<string, number>;
}

export interface BiomeMonsterWeightRecord {
  id: number;
  biome: string;
  weights: Record<string, number>;
}

export interface GameSettingRecord {
  id: number;
  key: string;
  value: number;
  category: string;
  description: string | null;
}

export interface MonsterTemplateRecord {
  id: number;
  type: string;
  emoji: string;
  name: string;
  baseHp: number;
  baseAttack: number;
  attackIntervalMs: number;
  color: string;
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

export interface ItemTemplateRecord {
  id: number;
  slug: string;
  name: string;
  type: string;
  slot: string | null;
  rarity: string;
  requiredLevel: number;
  stats: Record<string, number>;
  effects: Record<string, number>;
  healAmount: number | null;
  duration: number | null;
  professionSlug: string;
  professionLevel: number;
  sellValue: number;
}

export interface RecipeRecord {
  id: number;
  itemTemplateId: number;
  ingredients: Record<string, number>;
  quantity: number;
  known: boolean;
  itemSlug: string;
  itemName: string;
  itemType: string;
  itemRarity: string;
  professionSlug: string;
  professionLevel: number;
}

export interface ProfessionRecord {
  id: number;
  slug: string;
  label: string;
  position: number;
}

export interface PoiReportRecord {
  id: number;
  poiId: number;
  poiName: string | null;
  playerId: number;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PoiSubmissionRecord {
  id: number;
  playerId: number;
  name: string;
  description: string | null;
  lat: number;
  lon: number;
  photos: string[];
  status: string;
  rejectReason: string | null;
  createdAt: string;
  resolvedAt: string | null;
}
