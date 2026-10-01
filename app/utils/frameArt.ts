import type { InjectionKey, Ref } from "vue";
import type { IconCategory } from "~~/types/poi";

/**
 * Le cadre des fenêtres en 8 morceaux (catégorie « frame » du catalogue d'icônes). Règle
 * d'assemblage, identique dans l'aperçu de la page graphiste, les maquettes et — à la
 * livraison — `WoodenFrame` côté app : coins à leur taille aux quatre angles, par-dessus ;
 * côtés entre les coins, contre le bord extérieur, répétés bout à bout ; l'intérieur est
 * le fond de la fenêtre, dessiné en dedans des côtés.
 */
export const FRAME_SLOTS = [
  "corner-tl", "edge-top", "corner-tr",
  "edge-left", "edge-right",
  "corner-bl", "edge-bottom", "corner-br",
] as const;
export type FrameSlot = (typeof FRAME_SLOTS)[number];

export interface FramePiece {
  url: string;
  /** Taille de l'art, en pixels du fichier. */
  width: number;
  height: number;
}

export type FramePieces = Partial<Record<FrameSlot, FramePiece>>;

/** Les morceaux déposés de la catégorie « frame », avec leur URL absolue et leur taille. */
export function framePieces(cat: IconCategory | undefined, apiBase: string): FramePieces {
  const out: FramePieces = {};
  for (const item of cat?.items ?? []) {
    if (!item.url || !item.width || !item.height) continue;
    if (!(FRAME_SLOTS as readonly string[]).includes(item.slug)) continue;
    out[item.slug as FrameSlot] = { url: `${apiBase}${item.url}`, width: item.width, height: item.height };
  }
  return out;
}

export function isFrameComplete(pieces: FramePieces): boolean {
  return FRAME_SLOTS.every((s) => pieces[s]);
}

/** Les morceaux du cadre pour les maquettes : fournis par `MockScreens`, lus par `MockFrame`. */
export const MOCK_FRAME_KEY: InjectionKey<Ref<FramePieces>> = Symbol("mock-frame");
