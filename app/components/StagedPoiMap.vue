<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>

<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { maptilerKey: MAPTILER_KEY } = useRuntimeConfig().public;

const props = defineProps<{
  lat: number;
  lon: number;
}>();

const emit = defineEmits<{
  "update:position": [pos: { lat: number; lon: number }];
}>();

const colorMode = useColorMode();
const mapContainer = ref<HTMLDivElement>();
let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let marker: L.Marker | null = null;

function getTileUrl() {
  const style = colorMode.value === "dark" ? "topo-v2-dark" : "topo-v2";
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView([props.lat, props.lon], 16);

  tileLayer = L.tileLayer(getTileUrl(), {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
  }).addTo(map);

  marker = L.marker([props.lat, props.lon], {
    icon: L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#e74c3c;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    }),
  }).addTo(map);

  map.on("click", (e) => {
    const pos = { lat: e.latlng.lat, lon: e.latlng.lng };
    if (marker) marker.setLatLng([pos.lat, pos.lon]);
    emit("update:position", pos);
  });
});

watch(() => colorMode.value, () => {
  if (tileLayer) tileLayer.setUrl(getTileUrl());
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
