import type { InjectionKey, Ref } from "vue";
import type { IconCategory } from "~~/types/poi";
import type { MockPalette } from "~/utils/mockIcons";

/**
 * Les boutons de la graphiste (catégorie « button » du catalogue d'icônes) : trois dessins
 * entiers, un par taille, dont le centre est peint en gris neutre que l'app remplace par la
 * couleur du bouton. La règle, la même ici et — à l'intégration — dans `CandyButton` (voir
 * `.claude/rules/app.md`) :
 *
 * - un pixel est recoloré s'il est gris parfait (R = G = B), noir et blanc purs exceptés ;
 * - le gris de référence #808080 devient exactement la couleur du bouton ; plus foncé, il va
 *   vers le noir (ombre), plus clair vers le blanc (reflet), proportionnellement ;
 * - tout le reste, le contour, est gardé tel quel, y compris quand le bouton est grisé.
 */
export const BUTTON_SIZES = ["large", "medium", "small"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonVariant = "primary" | "secondary" | "danger";

/** Taille du libellé en DP, celle de `CandyButton` (17, et 14 en `small`). */
export const BUTTON_FONT: Record<ButtonSize, number> = { large: 17, medium: 17, small: 14 };

export const REFERENCE_GRAY = 128;

export interface ButtonArt {
  /** Le dessin tel que déposé, pour une balise <img>. */
  url: string;
  /** Le même fichier servi avec CORS, pour être lu dans un canvas (voir `GET /api/icons/file`). */
  pixelsUrl: string;
  width: number;
  height: number;
  /** Taille prévue par l'app, si le catalogue en fixe une. */
  expected: { width: number; height: number } | null;
}

export type ButtonArts = Partial<Record<ButtonSize, ButtonArt>>;

/** Les boutons déposés, par taille. */
export function buttonArts(cat: IconCategory | undefined, apiBase: string): ButtonArts {
  const out: ButtonArts = {};
  for (const item of cat?.items ?? []) {
    if (!item.url || !item.width || !item.height) continue;
    if (!(BUTTON_SIZES as readonly string[]).includes(item.slug)) continue;
    out[item.slug as ButtonSize] = {
      url: `${apiBase}${item.url}`,
      pixelsUrl: `${apiBase}${item.url.replace(/^\/uploads\/icons\//, "/api/icons/file/")}`,
      width: item.width,
      height: item.height,
      expected: item.size ?? null,
    };
  }
  return out;
}

/** Couleurs du centre et du libellé : mêmes jetons que `CandyButton` (un secondaire grisé garde les siennes). */
export function buttonColors(p: MockPalette, variant: ButtonVariant, disabled: boolean): { fill: string; text: string } {
  if (disabled && variant === "danger") return { fill: p.dangerDisabledBg, text: p.dangerDisabledText };
  if (disabled && variant === "primary") return { fill: p.btnDisabledBg, text: p.btnDisabledText };
  if (variant === "danger") return { fill: p.dangerBg, text: p.dangerText };
  if (variant === "secondary") return { fill: p.secBtnBg, text: p.secBtnText };
  return { fill: p.btnBg, text: p.btnText };
}

/** Un pixel du centre : gris parfait, ni noir ni blanc purs. */
export function isFillPixel(r: number, g: number, b: number, a: number): boolean {
  return a > 0 && r === g && g === b && r > 0 && r < 255;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Ce que devient le gris `v` (0-255) sur un bouton de couleur `color` (#rrggbb). */
export function tintGray(v: number, color: string): [number, number, number] {
  const c = hexToRgb(color);
  if (v <= REFERENCE_GRAY) {
    const k = v / REFERENCE_GRAY;
    return [c[0] * k, c[1] * k, c[2] * k];
  }
  const t = (v - REFERENCE_GRAY) / (255 - REFERENCE_GRAY);
  return [c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t];
}

/** Le dessin avec son gris remplacé par `color`. */
export function tint(src: ImageData, color: string): ImageData {
  const d = new Uint8ClampedArray(src.data);
  const ramp = new Map<number, [number, number, number]>();
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i]!;
    if (!isFillPixel(v, d[i + 1]!, d[i + 2]!, d[i + 3]!)) continue;
    let rgb = ramp.get(v);
    if (!rgb) ramp.set(v, (rgb = tintGray(v, color)));
    d[i] = rgb[0];
    d[i + 1] = rgb[1];
    d[i + 2] = rgb[2];
  }
  return new ImageData(d, src.width, src.height);
}

/** Pixels comptés dans un dessin : ceux que l'app recolore, et le gris de référence parmi eux. */
export function analyzeButton(px: ImageData): { fill: number; reference: number } {
  const d = px.data;
  let fill = 0;
  let reference = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (!isFillPixel(d[i]!, d[i + 1]!, d[i + 2]!, d[i + 3]!)) continue;
    fill++;
    if (d[i] === REFERENCE_GRAY) reference++;
  }
  return { fill, reference };
}

const pixelCache = new Map<string, Promise<ImageData>>();

/**
 * Les pixels exacts d'un dépôt. Les fichiers sont nommés par leur hash : une URL ne change
 * jamais de contenu, le cache vaut pour toute la session. Sans conversion de couleur ni
 * prémultiplication, pour lire les valeurs du fichier telles quelles.
 */
export function loadPixels(url: string): Promise<ImageData> {
  let p = pixelCache.get(url);
  if (!p) {
    p = (async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const bmp = await createImageBitmap(await res.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      return ctx.getImageData(0, 0, bmp.width, bmp.height);
    })();
    p.catch(() => pixelCache.delete(url));
    pixelCache.set(url, p);
  }
  return p;
}

const tintCache = new Map<string, Promise<string>>();

/** Le dessin recoloré, en data URL. */
export function tintedUrl(pixelsUrl: string, color: string): Promise<string> {
  const key = `${pixelsUrl}|${color}`;
  let p = tintCache.get(key);
  if (!p) {
    p = loadPixels(pixelsUrl).then((px) => {
      const canvas = document.createElement("canvas");
      canvas.width = px.width;
      canvas.height = px.height;
      canvas.getContext("2d")!.putImageData(tint(px, color), 0, 0);
      return canvas.toDataURL("image/png");
    });
    p.catch(() => tintCache.delete(key));
    tintCache.set(key, p);
  }
  return p;
}

/** Les boutons pour les maquettes : fournis par `MockScreens`, lus par `MockButton`. */
export const MOCK_BUTTON_KEY: InjectionKey<Ref<ButtonArts>> = Symbol("mock-button");
