<template>
  <MockPhone caption="Carte — écran de jeu">
    <div class="ms">
      <div ref="mapEl" class="ms-map" />
      <div v-if="!ready" class="ms-loading">{{ loadError || "Chargement de la carte…" }}</div>

      <div class="hud ms-top-left">
        <MockIconButton :src="icons.url('map', 'purchase')" title="Débloquer le jeu complet" />
      </div>
      <div class="hud ms-top-right">
        <MockIconButton :src="icons.url('map', 'route')" :badge="true" title="Parcours" />
        <MockIconButton :src="icons.url('map', 'quests')" title="Quêtes" />
        <MockIconButton :src="icons.url('map', 'submit-poi')" title="Proposer un lieu" />
        <MockIconButton :src="icons.url('map', 'settings')" title="Réglages" />
      </div>
      <div class="hud ms-zoom">
        <button type="button" class="ms-tap" @click="recenter"><MockIconButton :src="icons.url('map', 'recenter')" title="Recentrer" /></button>
        <button type="button" class="ms-tap" @click="zoomBy(1)"><MockIconButton :src="icons.url('map', 'zoom-in')" title="Zoomer" /></button>
        <button type="button" class="ms-tap" @click="zoomBy(-1)"><MockIconButton :src="icons.url('map', 'zoom-out')" title="Dézoomer" /></button>
      </div>
      <div class="hud ms-bar">
        <MockFrame :padding="16">
          <div class="ms-bar-inner">
            <MockIconButton
              v-for="b in BAR"
              :key="b.slug"
              :src="icons.url('bar', b.slug)"
              :size="36"
              :badge="b.slug === 'profile' ? 1 : false"
              :title="b.label"
            />
          </div>
        </MockFrame>
      </div>
    </div>

    <template #toolbar>
      <UButton size="sm" icon="i-lucide-sparkles" :disabled="!ready" @click="spawn">Simuler un spawn</UButton>
      <UButton size="sm" variant="ghost" color="neutral" :disabled="markerCount === 0" @click="clear">Effacer</UButton>
    </template>
  </MockPhone>
</template>

<script setup lang="ts">
import maplibregl, { Marker, type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MockIcons } from "~/utils/mockIcons";

/**
 * L'écran de jeu : la carte MapTiler recolorée comme dans l'app (zoom 17, rotation et
 * pinch désactivés, zoom par boutons), le joueur et son rayon de collecte, les boutons de
 * carte et la barre du bas. « Simuler un spawn » sème des lieux, ressources, monstres et
 * une porte de donjon aux tailles réelles de l'app, avec les icônes courantes du dépôt.
 */
const props = defineProps<{ icons: MockIcons }>();

const config = useRuntimeConfig();
const maptilerKey = config.public.maptilerKey as string;

// Parc de la Tête d'Or, Lyon : chemins, lac, bâtiments — de quoi juger la lisibilité.
// Rayon de collecte : `resourceCollectionRangeM` (60 m en BDD).
const CENTER: [number, number] = [4.8553, 45.7787];
const ZOOM = 17;

const BAR = [
  { slug: "profile", label: "Profil" },
  { slug: "inventory", label: "Inventaire" },
  { slug: "crafting", label: "Artisanat" },
  { slug: "equipment", label: "Équipement" },
  { slug: "merchant", label: "Marchand" },
];

// Taille à l'écran = 256 px × icon-size de MapLayers (0.15 / 0.13 / 0.10 / 0.18)
const SIZE = { pois: 38, resources: 33, monsters: 26, dungeon: 46 } as const;
const PLAN: Array<keyof typeof SIZE> = [
  ...Array<keyof typeof SIZE>(6).fill("pois"),
  ...Array<keyof typeof SIZE>(7).fill("resources"),
  ...Array<keyof typeof SIZE>(4).fill("monsters"),
  "dungeon",
];

const mapEl = ref<HTMLDivElement>();
const ready = ref(false);
const loadError = ref("");
const markerCount = ref(0);
let map: MlMap | null = null;
let markers: Marker[] = [];

function circlePolygon(center: [number, number], radiusM: number, steps = 48): GeoJSON.Feature {
  const [lon, lat] = center;
  const dLat = radiusM / 111_320;
  const dLon = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ring.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] }, properties: {} };
}

onMounted(async () => {
  try {
    const style = await loadThemedMapStyle(maptilerKey, DARK_MAP);
    map = new maplibregl.Map({
      container: mapEl.value!,
      style,
      center: CENTER,
      zoom: ZOOM,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
    });
    map.on("load", () => {
      const m = map!;
      m.addSource("radius", { type: "geojson", data: circlePolygon(CENTER, 60) });
      m.addLayer({ id: "radius-fill", type: "fill", source: "radius", paint: { "fill-color": MOCK_UI.mapRadius, "fill-opacity": 0.08 } });
      m.addLayer({ id: "radius-line", type: "line", source: "radius", paint: { "line-color": MOCK_UI.mapRadius, "line-width": 3 } });
      m.addSource("player", { type: "geojson", data: { type: "Feature", geometry: { type: "Point", coordinates: CENTER }, properties: {} } });
      m.addLayer({
        id: "player-dot",
        type: "circle",
        source: "player",
        paint: { "circle-radius": 6, "circle-color": MOCK_UI.playerDot, "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 },
      });
      ready.value = true;
    });
    map.on("error", (e) => {
      if (!ready.value) loadError.value = `Carte indisponible : ${e.error?.message ?? "erreur"}`;
    });
  } catch (err: any) {
    loadError.value = `Carte indisponible : ${err.message}`;
  }
});

onBeforeUnmount(() => {
  clear();
  map?.remove();
  map = null;
});

function zoomBy(delta: number) {
  if (!map) return;
  const z = Math.max(5, Math.min(20, map.getZoom() + delta));
  map.easeTo({ zoom: z, duration: 250 });
}

function recenter() {
  map?.easeTo({ center: CENTER, zoom: ZOOM, duration: 400 });
}

function clear() {
  for (const m of markers) m.remove();
  markers = [];
  markerCount.value = 0;
}

/** Une position libre dans la zone jouable de l'écran : hors HUD, loin du joueur et des autres spawns. */
function freeSpot(W: number, H: number, placed: Array<[number, number]>): [number, number] | null {
  for (let tries = 0; tries < 60; tries++) {
    const x = 28 + Math.random() * (W - 56);
    const y = 76 + Math.random() * (H - 76 - 140);
    const farFromPlayer = Math.hypot(x - W / 2, y - H / 2) >= 70;
    if (farFromPlayer && placed.every(([px, py]) => Math.hypot(px - x, py - y) >= 46)) return [x, y];
  }
  return null;
}

function spawn() {
  if (!map || !mapEl.value) return;
  clear();
  map.easeTo({ center: CENTER, zoom: ZOOM, duration: 0 });
  const W = mapEl.value.clientWidth;
  const H = mapEl.value.clientHeight;
  const placed: Array<[number, number]> = [];
  const usedPois: string[] = ["dungeon", "unknown"];
  let unknownShown = false;

  for (const kind of PLAN) {
    let src: string | null = null;
    let label = "";
    if (kind === "dungeon") {
      src = props.icons.url("pois", "dungeon");
      label = "Donjon";
    } else if (kind === "pois") {
      // Un lieu sur six est « non découvert » : le pin « ? » fait partie du rendu réel.
      if (!unknownShown && Math.random() < 0.5) {
        unknownShown = true;
        src = props.icons.url("pois", "unknown");
        label = "Lieu non découvert";
      } else {
        const item = props.icons.pick("pois", usedPois);
        if (!item) continue;
        usedPois.push(item.slug);
        src = `${props.icons.url("pois", item.slug)}`;
        label = item.label;
      }
    } else {
      const item = props.icons.pick(kind);
      if (!item) continue;
      src = props.icons.url(kind, item.slug);
      label = item.label;
    }
    if (!src) continue;

    const spot = freeSpot(W, H, placed);
    if (!spot) continue;
    placed.push(spot);

    const img = document.createElement("img");
    img.src = src;
    img.alt = label;
    img.title = label;
    img.draggable = false;
    img.style.width = `${SIZE[kind]}px`;
    img.style.height = `${SIZE[kind]}px`;
    img.style.cursor = "pointer";
    const marker = new Marker({ element: img, anchor: "center" }).setLngLat(map.unproject(spot)).addTo(map);
    markers.push(marker);
  }
  markerCount.value = markers.length;
}
</script>

<style scoped>
.ms {
  position: absolute;
  inset: 0;
  background: #1e1a14;
}
.ms-map {
  position: absolute;
  inset: 0;
}
.ms-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a08868;
  font-size: 18px;
  text-align: center;
  padding: 0 24px;
}
.hud {
  position: absolute;
  z-index: 5;
}
.ms-top-left { top: 8px; left: 6px; display: flex; }
.ms-top-right { top: 8px; right: 6px; display: flex; }
.ms-zoom { right: 6px; bottom: 116px; display: flex; flex-direction: column; }
.ms-bar { left: 16px; right: 16px; bottom: 16px; }
.ms-bar-inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 4px;
}
.ms-tap {
  all: unset;
  cursor: pointer;
  display: block;
}
.ms-tap:active { transform: translate(2px, 2px); }
</style>
