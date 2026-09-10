import type { InjectionKey, Ref } from "vue";
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

// ---------------------------------------------------------------------------------------
// Thème des maquettes
//
// Les deux palettes de l'app (`app/theme.ts`, DARK_UI / LIGHT_UI + fond de carte), copiées
// ici. `MockScreens` fournit le thème choisi ; `MockPhone` pose la palette en variables CSS
// sur le téléphone, et chaque composant de maquette n'utilise que `var(--…)` — jamais une
// couleur en dur, sinon l'écran ne change pas de thème. Garder aligné avec le mobile.
// ---------------------------------------------------------------------------------------

export type MockTheme = "dark" | "light";

export const MOCK_THEME_KEY: InjectionKey<Ref<MockTheme>> = Symbol("mock-theme");

export interface MockPalette {
  panelBg: string; text: string; textStrong: string; accent: string; accentText: string; accentWash: string;
  closeBtnBg: string; backdropBg: string; statusBarBg: string;
  btnBg: string; btnBorder: string; btnText: string; btnDisabledBg: string; btnDisabledBorder: string; btnDisabledText: string;
  secBtnBg: string; secBtnBorder: string; secBtnText: string;
  dangerBg: string; dangerBorder: string; dangerText: string; dangerDisabledBg: string; dangerDisabledBorder: string; dangerDisabledText: string;
  statText: string; affixText: string; levelReqText: string; errorText: string; successText: string;
  hpPlayer: string; hpMonster: string; barBorder: string; barTrack: string; barFill: string;
  inputBg: string; inputBorder: string; inputText: string; placeholderText: string; subtitleText: string;
  cardBg: string; cardFill: string; cardEdge: string; shadow: string; contrastText: string;
  frameBevelLight: string; frameBevelDark: string; frameSurface: string;
  mapBg: string; mapLine: string; mapRadius: string; playerDot: string;
  rarityCommon: string; rarityUncommon: string; rarityRare: string; rarityEpic: string; rarityLegendary: string;
}

export const MOCK_PALETTES: Record<MockTheme, MockPalette> = {
  dark: {
    panelBg: "#1a1410", text: "#c8b898", textStrong: "#f0e6d2", accent: "#c4a882", accentText: "#1a1410", accentWash: "rgba(196,168,130,0.1)",
    closeBtnBg: "#2a2218", backdropBg: "rgba(14,10,6,0.7)", statusBarBg: "#1a1410",
    btnBg: "#6b4c32", btnBorder: "#3d2a18", btnText: "#f0e6d2", btnDisabledBg: "#3a3028", btnDisabledBorder: "#2a2018", btnDisabledText: "#8a7a68",
    secBtnBg: "#2a2218", secBtnBorder: "#000000", secBtnText: "#c8b898",
    dangerBg: "#7a2222", dangerBorder: "#4a1010", dangerText: "#f0e6d2", dangerDisabledBg: "#4a2020", dangerDisabledBorder: "#2a1010", dangerDisabledText: "#8a6060",
    statText: "#6abf6a", affixText: "#b89adf", levelReqText: "#cf6a6a", errorText: "#E74C3C", successText: "#2ECC71",
    hpPlayer: "#2ECC71", hpMonster: "#E74C3C", barBorder: "#0d0906", barTrack: "#2a2218", barFill: "#c4a882",
    inputBg: "rgba(255,255,255,0.08)", inputBorder: "rgba(255,255,255,0.15)", inputText: "#f0e6d2", placeholderText: "#888888", subtitleText: "#aaaaaa",
    cardBg: "rgba(255,255,255,0.05)", cardFill: "#46341F", cardEdge: "#1E140C", shadow: "#000000", contrastText: "#ffffff",
    frameBevelLight: "#7d6448", frameBevelDark: "#352818", frameSurface: "#4d3015",
    mapBg: "#1e1a14", mapLine: "#252018", mapRadius: "#a08868", playerDot: "#4A90D9",
    rarityCommon: "#9d9d9d", rarityUncommon: "#1eff00", rarityRare: "#0070dd", rarityEpic: "#a335ee", rarityLegendary: "#ff8000",
  },
  light: {
    panelBg: "#f0e6d2", text: "#4a3828", textStrong: "#3a2218", accent: "#3a2218", accentText: "#f0e6d2", accentWash: "rgba(58,34,24,0.1)",
    closeBtnBg: "#c8bca8", backdropBg: "rgba(40,30,15,0.5)", statusBarBg: "#d4c8b0",
    btnBg: "#5c3a22", btnBorder: "#3a2010", btnText: "#f0e6d2", btnDisabledBg: "#b8a890", btnDisabledBorder: "#9a8a70", btnDisabledText: "#6a5a48",
    secBtnBg: "#c8b898", secBtnBorder: "#a09078", secBtnText: "#3a2218",
    dangerBg: "#8a2a2a", dangerBorder: "#5a1515", dangerText: "#f0e6d2", dangerDisabledBg: "#c0a090", dangerDisabledBorder: "#a08878", dangerDisabledText: "#6a5a48",
    statText: "#2d6a2d", affixText: "#6a4a9a", levelReqText: "#8a2a2a", errorText: "#c0392b", successText: "#27ae60",
    hpPlayer: "#27ae60", hpMonster: "#c0392b", barBorder: "#2a1e12", barTrack: "#c8bca8", barFill: "#5a3820",
    inputBg: "rgba(0,0,0,0.06)", inputBorder: "rgba(0,0,0,0.15)", inputText: "#3a2218", placeholderText: "#8a7a68", subtitleText: "#6a5a48",
    cardBg: "rgba(0,0,0,0.04)", cardFill: "#E3CFAC", cardEdge: "#B99C6E", shadow: "#000000", contrastText: "#ffffff",
    frameBevelLight: "#8a6e4e", frameBevelDark: "#2a1e12", frameSurface: "#5a3820",
    mapBg: "#e8dcc8", mapLine: "#ddd0ba", mapRadius: "#3a2218", playerDot: "#4A90D9",
    rarityCommon: "#6a6a6a", rarityUncommon: "#1a8a00", rarityRare: "#0055aa", rarityEpic: "#7a2db0", rarityLegendary: "#cc6600",
  },
};

/** La palette en variables CSS (`--panel-bg`, `--hp-player`, …), à poser sur la racine du téléphone. */
export function paletteVars(theme: MockTheme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(MOCK_PALETTES[theme])) {
    out[`--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  return out;
}

/** Références `var(--…)` pour les styles inline des maquettes (les feuilles scoped les écrivent directement). */
export const MOCK_UI = {
  hpPlayer: "var(--hp-player)",
  hpMonster: "var(--hp-monster)",
  rarity: {
    common: "var(--rarity-common)",
    uncommon: "var(--rarity-uncommon)",
    rare: "var(--rarity-rare)",
    epic: "var(--rarity-epic)",
    legendary: "var(--rarity-legendary)",
  },
} as const;
