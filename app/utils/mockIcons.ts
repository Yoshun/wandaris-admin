import type { IconItem, IconsResponse } from "~~/types/poi";

/**
 * Accès aux icônes du dépôt pour les maquettes d'écrans : ce qui est affiché est l'état
 * courant du dépôt (livraison du graphiste comprise), jamais un fichier figé dans l'admin.
 */
export interface MockIcons {
  /** URL absolue de l'icône, ou null si aucune version n'existe. */
  url(category: string, slug: string): string | null;
  /** Entrées d'une catégorie qui ont un visuel. */
  list(category: string): IconItem[];
  /** Un tirage aléatoire parmi les entrées visibles d'une catégorie. */
  pick(category: string, exclude?: string[]): IconItem | null;
}

export function buildMockIcons(data: IconsResponse, apiBase: string): MockIcons {
  const byKey = new Map<string, IconItem>();
  const byCat = new Map<string, IconItem[]>();
  for (const cat of data.categories) {
    byCat.set(cat.id, cat.items.filter((i) => i.url));
    for (const item of cat.items) byKey.set(`${cat.id}/${item.slug}`, item);
  }
  return {
    url(category, slug) {
      const item = byKey.get(`${category}/${slug}`);
      return item?.url ? `${apiBase}${item.url}` : null;
    },
    list(category) {
      return byCat.get(category) ?? [];
    },
    pick(category, exclude = []) {
      const pool = (byCat.get(category) ?? []).filter((i) => !exclude.includes(i.slug));
      return pool.length ? pool[Math.floor(Math.random() * pool.length)]! : null;
    },
  };
}

export const MOCK_UI = {
  panelBg: "#1a1410",
  text: "#c8b898",
  accent: "#c4a882",
  subtitleText: "#aaaaaa",
  closeBtnBg: "#2a2218",
  backdropBg: "rgba(14,10,6,0.7)",
  cardBg: "rgba(255,255,255,0.05)",
  cardFill: "#46341F",
  cardEdge: "#1E140C",
  frameBevelDark: "#352818",
  frameFillLight: "#2C2016",
  frameFillDark: "#160F0A",
  hpPlayer: "#2ECC71",
  hpMonster: "#E74C3C",
  statText: "#6abf6a",
  playerDot: "#4A90D9",
  mapRadius: "#a08868",
  mapBg: "#1e1a14",
  inputBg: "rgba(255,255,255,0.08)",
  inputText: "#f0e6d2",
  placeholder: "#888888",
  rarity: { common: "#9d9d9d", uncommon: "#1eff00", rare: "#0070dd", epic: "#a335ee", legendary: "#ff8000" },
} as const;
