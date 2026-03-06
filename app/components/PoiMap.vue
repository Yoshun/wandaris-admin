<template>
  <div ref="mapContainer" class="w-full h-full rounded-lg overflow-hidden" />
</template>

<script setup lang="ts">
import type { PoiDefinition } from "~~/types/poi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { maptilerKey: MAPTILER_KEY } = useRuntimeConfig().public;

const props = defineProps<{
  pois: PoiDefinition[];
  selectedId?: number | null;
  clickable?: boolean;
}>();

const emit = defineEmits<{
  poiClick: [poi: PoiDefinition];
  mapClick: [latlng: { lat: number; lon: number }];
}>();

const colorMode = useColorMode();
const mapContainer = ref<HTMLDivElement>();
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let markersLayer: L.LayerGroup | null = null;
let clickMarker: L.Marker | null = null;
let hasFittedBounds = false;

function getTileUrl() {
  const style = colorMode.value === "dark" ? "topo-v2-dark" : "topo-v2";
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

function createPoiIcon(selected: boolean) {
  const size = selected ? 30 : 22;
  const border = selected ? "3px solid #F5D442" : "2px solid rgba(255,255,255,0.8)";
  const fontSize = selected ? 13 : 10;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#dc2626;border:${border};
      display:flex;align-items:center;justify-content:center;
      font-size:${fontSize}px;line-height:1;
      box-shadow:0 2px 6px rgba(0,0,0,0.5);
      cursor:pointer;
    ">\u{1F441}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createClickIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#F5D442;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView([43.706, 2.139], 14);

  tileLayer = L.tileLayer(getTileUrl(), {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>',
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  map.on("click", (e) => {
    if (!props.clickable) return;
    const latlng = { lat: e.latlng.lat, lon: e.latlng.lng };
    emit("mapClick", latlng);

    if (clickMarker) {
      clickMarker.setLatLng(e.latlng);
    } else {
      clickMarker = L.marker(e.latlng, { icon: createClickIcon() }).addTo(map!);
    }
  });

  updateMarkers();
});

function updateMarkers() {
  if (!markersLayer || !map) return;
  markersLayer.clearLayers();

  for (const poi of props.pois) {
    const selected = poi.id === props.selectedId;
    const marker = L.marker([poi.lat, poi.lon], {
      icon: createPoiIcon(selected),
    });
    const popupContent = document.createElement('strong');
    popupContent.textContent = poi.name;
    marker.bindPopup(popupContent);
    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      emit("poiClick", poi);
    });
    markersLayer.addLayer(marker);
  }

  // Only fit bounds on first load
  if (!hasFittedBounds && props.pois.length > 0) {
    hasFittedBounds = true;
    const bounds = L.latLngBounds(props.pois.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// Rebuild markers when pois change
watch(
  () => props.pois,
  () => updateMarkers(),
  { deep: true }
);

// Only update highlight when selectedId changes (no full rebuild)
watch(
  () => props.selectedId,
  () => {
    if (!markersLayer || !map) return;
    const layers = markersLayer.getLayers() as L.Marker[];
    for (let i = 0; i < props.pois.length; i++) {
      const poi = props.pois[i];
      if (!poi) continue;
      const marker = layers[i];
      if (!marker) continue;
      const selected = poi.id === props.selectedId;
      marker.setIcon(createPoiIcon(selected));
    }
  }
);

// Switch tile layer on color mode change
watch(() => colorMode.value, () => {
  if (!map || !tileLayer) return;
  tileLayer.setUrl(getTileUrl());
});

function setClickPosition(lat: number, lon: number) {
  if (!map) return;
  const latlng = L.latLng(lat, lon);
  if (clickMarker) {
    clickMarker.setLatLng(latlng);
  } else {
    clickMarker = L.marker(latlng, { icon: createClickIcon() }).addTo(map);
  }
}

function panTo(lat: number, lon: number) {
  if (!map) return;
  map.panTo([lat, lon]);
}

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

defineExpose({ setClickPosition, panTo });
</script>
