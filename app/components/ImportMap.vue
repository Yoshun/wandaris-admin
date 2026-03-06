<template>
  <div ref="mapContainer" class="w-full h-full rounded-lg overflow-hidden" />
</template>

<script setup lang="ts">
import type { ImportZone } from "~~/types/poi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { maptilerKey: MAPTILER_KEY } = useRuntimeConfig().public;

const props = defineProps<{
  zones: ImportZone[];
  previewRadius: number;
}>();

const emit = defineEmits<{
  mapClick: [latlng: { lat: number; lon: number }];
}>();

const colorMode = useColorMode();
const mapContainer = ref<HTMLDivElement>();
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let zonesLayer: L.LayerGroup | null = null;
let previewCircle: L.Circle | null = null;
let previewMarker: L.Marker | null = null;

function getTileUrl() {
  const style = colorMode.value === "dark" ? "topo-v2-dark" : "topo-v2";
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView([46.6, 2.5], 6); // France

  tileLayer = L.tileLayer(getTileUrl(), {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>',
  }).addTo(map);

  zonesLayer = L.layerGroup().addTo(map);

  map.on("click", (e) => {
    const latlng = { lat: e.latlng.lat, lon: e.latlng.lng };
    emit("mapClick", latlng);
    showPreview(e.latlng.lat, e.latlng.lng);
  });

  drawZones();
});

function drawZones() {
  if (!zonesLayer || !map) return;
  zonesLayer.clearLayers();

  for (const zone of props.zones) {
    const circle = L.circle([zone.lat, zone.lon], {
      radius: zone.radiusM,
      color: "#6b7280",
      fillColor: "#6b7280",
      fillOpacity: 0.15,
      weight: 1,
      interactive: false,
    });
    zonesLayer.addLayer(circle);

    const cross = L.marker([zone.lat, zone.lon], {
      icon: L.divIcon({
        className: "",
        html: '<div style="width:14px;height:14px;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:16px;font-weight:bold;line-height:1;cursor:pointer;">+</div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    });
    cross.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      emit("mapClick", { lat: zone.lat, lon: zone.lon });
      showPreview(zone.lat, zone.lon);
    });
    zonesLayer.addLayer(cross);
  }
}

function showPreview(lat: number, lon: number) {
  if (!map) return;

  if (previewCircle) {
    previewCircle.setLatLng([lat, lon]);
    previewCircle.setRadius(props.previewRadius);
  } else {
    previewCircle = L.circle([lat, lon], {
      radius: props.previewRadius,
      color: "#F5D442",
      fillColor: "#F5D442",
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "6 4",
      interactive: false,
    }).addTo(map);
  }

  if (previewMarker) {
    previewMarker.setLatLng([lat, lon]);
  } else {
    previewMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "",
        html: '<div style="width:12px;height:12px;border-radius:50%;background:#F5D442;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    }).addTo(map);
  }
}

watch(() => props.zones, () => drawZones(), { deep: true });

watch(() => props.previewRadius, () => {
  if (previewCircle) {
    previewCircle.setRadius(props.previewRadius);
  }
});

// Switch tile layer on color mode change
watch(() => colorMode.value, () => {
  if (!map || !tileLayer) return;
  tileLayer.setUrl(getTileUrl());
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
