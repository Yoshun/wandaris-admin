/**
 * Portage de `app/mapStyle.ts` (mobile) : le style MapTiler `topo-v2` recoloré dans la
 * palette « burnt parchment » de l'app, sans aucun libellé. Sert aux maquettes de la page
 * /graphiste, pour que la carte des écrans simulés soit celle du jeu et pas une carte web.
 * Garder les deux fichiers alignés si la palette ou les règles de recoloration changent.
 */

export interface MapPalette {
  bg: string;
  water: string;
  waterLine: string;
  building: string;
  road: string;
  roadMajor: string;
  fill: string;
  line: string;
  contour: string;
  hillShadow: string;
  hillHighlight: string;
}

export const DARK_MAP: MapPalette = {
  bg: "#1e1a14",
  water: "#1a2535",
  waterLine: "#253040",
  building: "#2a2520",
  road: "#3a3428",
  roadMajor: "#4a4438",
  fill: "#252018",
  line: "#302a20",
  contour: "#282218",
  hillShadow: "#161210",
  hillHighlight: "#252018",
};

export const LIGHT_MAP: MapPalette = {
  bg: "#e8dcc8",
  water: "#8ba8b8",
  waterLine: "#7a98a8",
  building: "#c8bca8",
  road: "#d4c8b0",
  roadMajor: "#c0b498",
  fill: "#ddd0ba",
  line: "#c8bca8",
  contour: "#d0c4ae",
  hillShadow: "#d0c0a0",
  hillHighlight: "#f0e6d2",
};

const isWater = (id: string) => /water|ocean|sea|lake|river|stream|canal|basin|reservoir/i.test(id);
const isBuilding = (id: string) => /building/i.test(id);
const isRoad = (id: string) =>
  /road|highway|street|path|track|tunnel|bridge|rail|ferry|motorway|trunk|primary|secondary|tertiary|link|service|pedestrian|runway|taxiway|pier|lift|cable/i.test(id);
const isMajorRoad = (id: string) => /highway|motorway|trunk|primary|major/i.test(id);

function forceColor(value: any, color: string): any {
  if (value == null) return color;
  if (typeof value === "string" && /^(#|hsl|rgb)/i.test(value)) return color;
  if (typeof value === "object" && !Array.isArray(value) && value.stops) {
    return { ...value, stops: value.stops.map((stop: any[]) => [stop[0], color]) };
  }
  if (Array.isArray(value)) {
    return value.map((item: any) => (typeof item === "string" && /^(#|hsl|rgb)/i.test(item) ? color : item));
  }
  return color;
}

function recolorLayer(layer: any, palette: MapPalette): any {
  const id: string = layer.id ?? "";
  const paint = { ...(layer.paint ?? {}) };

  switch (layer.type) {
    case "background":
      paint["background-color"] = palette.bg;
      return { ...layer, paint };
    case "hillshade":
      paint["hillshade-shadow-color"] = palette.hillShadow;
      paint["hillshade-highlight-color"] = palette.hillHighlight;
      paint["hillshade-accent-color"] = palette.bg;
      return { ...layer, paint };
    case "fill": {
      const color = isWater(id) ? palette.water : isBuilding(id) ? palette.building : palette.fill;
      paint["fill-color"] = paint["fill-color"] != null ? forceColor(paint["fill-color"], color) : color;
      if (paint["fill-outline-color"] != null) paint["fill-outline-color"] = forceColor(paint["fill-outline-color"], color);
      return { ...layer, paint };
    }
    case "fill-extrusion":
      paint["fill-extrusion-color"] =
        paint["fill-extrusion-color"] != null ? forceColor(paint["fill-extrusion-color"], palette.building) : palette.building;
      return { ...layer, paint };
    case "line": {
      let color = palette.line;
      if (isWater(id)) color = palette.waterLine;
      else if (/contour/i.test(id)) color = palette.contour;
      else if (isRoad(id)) color = isMajorRoad(id) ? palette.roadMajor : palette.road;
      paint["line-color"] = paint["line-color"] != null ? forceColor(paint["line-color"], color) : color;
      return { ...layer, paint };
    }
    default:
      return layer;
  }
}

let rawStyleCache: any = null;

export async function loadThemedMapStyle(maptilerKey: string, palette: MapPalette): Promise<any> {
  if (!rawStyleCache) {
    const res = await fetch(`https://api.maptiler.com/maps/topo-v2/style.json?key=${maptilerKey}`);
    if (!res.ok) throw new Error(`MapTiler style ${res.status}`);
    rawStyleCache = await res.json();
  }
  const layers = rawStyleCache.layers.filter((l: any) => l.type !== "symbol").map((l: any) => recolorLayer(l, palette));
  const used = new Set(layers.map((l: any) => l.source).filter(Boolean));
  const sources: Record<string, any> = {};
  for (const [key, val] of Object.entries(rawStyleCache.sources ?? {})) if (used.has(key)) sources[key] = val;
  // Le glyphs/sprite du style d'origine restent référencés ; sans symboles ils sont inutiles
  // mais inoffensifs.
  return { ...rawStyleCache, layers, sources };
}
