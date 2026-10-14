import type { InjectionKey, Ref } from "vue";
import { convertIndexedToRgb, decode as decodePng, encode as encodePng, type DecodedPng } from "fast-png";
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
 * - tout le reste, le contour, est gardé tel quel.
 *
 * Grisé (choix du 14 octobre 2026) : le centre prend les couleurs `*Disabled*` et tout le
 * dessin, contour compris, est estompé (`DISABLED_ART_OPACITY`). Le libellé reste opaque : un
 * bouton grisé porte parfois une information (« Prochaine visite dans 23h 59min »). Sans ça,
 * un bouton grisé et un secondaire ne se distinguaient que par la couleur du texte.
 */
export const BUTTON_SIZES = ["large", "medium", "small"] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonVariant = "primary" | "secondary" | "danger";

/** Taille du libellé en DP, celle de `CandyButton` (17, et 14 en `small`). */
export const BUTTON_FONT: Record<ButtonSize, number> = { large: 17, medium: 17, small: 14 };

export const REFERENCE_GRAY = 128;

/** Opacité du dessin d'un bouton grisé, contour compris (le libellé reste opaque). */
export const DISABLED_ART_OPACITY = 0.5;

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

// ---------------------------------------------------------------------------------------
// Texture du centre, en code (14 octobre 2026) : « bombé + veinure », retenue parmi quatre
// essais (bombé seul, veinure seule, grain).
//
// La texture module les pixels #808080 AVANT la recoloration : elle est faite de gris, elle
// prend donc la couleur de chaque bouton, comme les reflets et les ombres de la graphiste
// (ses autres gris ne sont pas touchés). Au pixel de l'art, déterministe : le même bouton a
// toujours la même texture. À l'intégration, `icons-sync` reprend `texture()` telle quelle
// (même hachage) avant de découper les calques. Limite de la rampe : sur une couleur très
// sombre (le secondaire du thème sombre), un gris plus foncé ne se voit presque plus.
// ---------------------------------------------------------------------------------------

/** Hachage entier déterministe d'un pixel, dans [0, 1[. */
function noise(x: number, y: number, seed: number): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Relief : bande claire en haut, sombre en bas, tramée en damier à la jonction. `t` = hauteur relative dans le centre. */
function bombe(x: number, y: number, t: number): number {
  if (t < 0.25) return 10;
  if (t < 0.35) return (x + y) % 2 === 0 ? 10 : 0;
  if (t > 0.8) return -12;
  if (t > 0.7) return (x + y) % 2 === 0 ? -12 : 0;
  return 0;
}

/** Traits horizontaux de longueur variable, décalés d'une ligne à l'autre : bois peint, cuir. */
function veinure(x: number, y: number, amp: number): number {
  const seg = 6 + Math.floor(noise(0, y, 2) * 10);
  const k = Math.floor((x + Math.floor(noise(1, y, 3) * 16)) / seg);
  const r = noise(k, y, 4);
  return r < 0.22 ? -amp : r > 0.9 ? Math.round(amp * 0.7) : 0;
}

/** Le dessin avec ses pixels #808080 modulés par la texture (toujours des gris parfaits). */
export function texture(src: ImageData): ImageData {
  const { width: w, height: h } = src;
  const d = new Uint8ClampedArray(src.data);
  const isRef = (i: number) => d[i + 3]! > 0 && d[i] === REFERENCE_GRAY && d[i + 1] === REFERENCE_GRAY && d[i + 2] === REFERENCE_GRAY;
  // Hauteur du centre gris, pour que le relief suive le centre et pas le dessin entier
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isRef((y * w + x) * 4)) {
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  const span = Math.max(1, y1 - y0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isRef(i)) continue;
      const delta = bombe(x, y, (y - y0) / span) + veinure(x, y, 8);
      const v = Math.max(1, Math.min(254, REFERENCE_GRAY + delta));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
  }
  return new ImageData(d, w, h);
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

// ---------------------------------------------------------------------------------------
// Lecture et écriture des pixels SANS canvas
//
// Firefox, Brave et Safari brouillent ce qu'une page relit d'un canvas (`getImageData`,
// `toDataURL`) : une protection anti-pistage qui décale d'une unité quelques pixels au hasard.
// Un #808080 relu (128, 129, 128) n'est plus un gris parfait, il n'est pas recoloré : le
// bouton se couvre de points gris (constaté chez la graphiste le 14 octobre 2026). Le PNG est
// donc décodé et réencodé en JavaScript (`fast-png`) : les valeurs du fichier, exactement, et
// aucune lecture de canvas. Les profils de couleur (sRGB, gAMA) sont ignorés, comme dans l'app.
// ---------------------------------------------------------------------------------------

/** Un PNG décodé, ramené en RGBA 8 bits. */
function toRgba(png: DecodedPng): Uint8ClampedArray<ArrayBuffer> {
  const { width, height, depth } = png;
  const n = width * height;
  const out = new Uint8ClampedArray(n * 4);
  if (png.palette) {
    const rgb = convertIndexedToRgb(png);
    const ch = png.palette[0]!.length; // 4 si la palette porte un tRNS
    for (let i = 0; i < n; i++) {
      out[i * 4] = rgb[i * ch]!;
      out[i * 4 + 1] = rgb[i * ch + 1]!;
      out[i * 4 + 2] = rgb[i * ch + 2]!;
      out[i * 4 + 3] = ch === 4 ? rgb[i * ch + 3]! : 255;
    }
    return out;
  }
  if (depth !== 8 && depth !== 16) throw new Error(`PNG en ${depth} bits par canal non pris en charge`);
  const ch = png.channels;
  const v = (k: number) => (depth === 16 ? png.data[k]! >> 8 : png.data[k]!);
  // tRNS sans palette : une couleur exacte (gris ou RGB) rendue transparente
  const key = png.transparency;
  for (let i = 0; i < n; i++) {
    const b = i * ch;
    const gray = ch <= 2;
    const r = v(b);
    const g = gray ? r : v(b + 1);
    const bl = gray ? r : v(b + 2);
    let a = ch === 2 ? v(b + 1) : ch === 4 ? v(b + 3) : 255;
    if (key && (ch === 1 || ch === 3)) {
      const same = ch === 1 ? png.data[b] === key[0] : png.data[b] === key[0] && png.data[b + 1] === key[1] && png.data[b + 2] === key[2];
      if (same) a = 0;
    }
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = bl;
    out[i * 4 + 3] = a;
  }
  return out;
}

const pixelCache = new Map<string, Promise<ImageData>>();

/**
 * Les pixels exacts d'un dépôt. Les fichiers sont nommés par leur hash : une URL ne change
 * jamais de contenu, le cache vaut pour toute la session.
 */
export function loadPixels(url: string): Promise<ImageData> {
  let p = pixelCache.get(url);
  if (!p) {
    p = (async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const png = decodePng(new Uint8Array(await res.arrayBuffer()));
      return new ImageData(toRgba(png), png.width, png.height);
    })();
    p.catch(() => pixelCache.delete(url));
    pixelCache.set(url, p);
  }
  return p;
}

const tintCache = new Map<string, Promise<string>>();

/** Le dessin texturé et recoloré, en URL d'objet (PNG encodé en JavaScript, pas par un canvas). */
export function tintedUrl(pixelsUrl: string, color: string): Promise<string> {
  const key = `${pixelsUrl}|${color}`;
  let p = tintCache.get(key);
  if (!p) {
    p = loadPixels(pixelsUrl).then((px) => {
      const out = tint(texture(px), color);
      const bytes = encodePng({ width: out.width, height: out.height, data: out.data, channels: 4, depth: 8 });
      // Copie dans un ArrayBuffer ordinaire : un Blob refuse un tampon potentiellement partagé
      return URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "image/png" }));
    });
    p.catch(() => tintCache.delete(key));
    tintCache.set(key, p);
  }
  return p;
}

/** Les boutons pour les maquettes : fournis par `MockScreens`, lus par `MockButton`. */
export const MOCK_BUTTON_KEY: InjectionKey<Ref<ButtonArts>> = Symbol("mock-button");
