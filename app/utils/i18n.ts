export const POI_TYPE_LABELS: Record<string, string> = {
  castle: "Chateau",
  church: "Eglise",
  ruin: "Ruine",
  fort: "Fort",
  manor: "Manoir",
  archaeological_site: "Site archeologique",
  tower: "Tour",
  city_gate: "Porte de ville",
  summit: "Sommet",
  viewpoint: "Point de vue",
  waterfall: "Cascade",
  cave: "Grotte",
  cliff: "Falaise",
  arch: "Arche naturelle",
  hot_spring: "Source chaude",
  volcano: "Volcan",
  glacier: "Glacier",
  lake: "Lac",
  bridge: "Pont",
  garden: "Jardin",
  square: "Place",
  megalith: "Megalithes",
  rock: "Rocher",
  windmill: "Moulin a vent",
  lighthouse: "Phare",
  water_mill: "Moulin a eau",
  aqueduct: "Aqueduc",
  geological: "Curiosite geologique",
};

export const POI_DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  very_hard: "Tres difficile",
};

export function typeLabel(type: string): string {
  return POI_TYPE_LABELS[type] ?? type;
}

export function difficultyLabel(difficulty: string): string {
  return POI_DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

export function parseGoogleMapsUrl(url: string): { lat: number; lon: number } | null {
  // Try !3d...!4d... (exact marker position)
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    return { lat: parseFloat(dataMatch[1]), lon: parseFloat(dataMatch[2]) };
  }
  // Fallback to @lat,lon in URL
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
  }
  return null;
}
