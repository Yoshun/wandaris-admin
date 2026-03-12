<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-primary">{{ title }}</h2>
      <UButton variant="solid" color="neutral" size="xs" @click="emit('cancel')">Fermer</UButton>
    </div>

    <form class="space-y-3" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-sm text-muted mb-1">Nom</label>
        <UInput v-model="form.name" class="w-full" required />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-muted mb-1">Type</label>
          <USelect v-model="form.type" :items="typeOptions" class="w-full" />
        </div>
        <div>
          <label class="block text-sm text-muted mb-1">Difficulte</label>
          <USelect v-model="form.difficulty" :items="difficultyOptions" class="w-full" />
        </div>
      </div>

      <!-- Google Maps link -->
      <div>
        <label class="block text-sm text-muted mb-1">Lien Google Maps</label>
        <div class="flex gap-2">
          <UInput v-model="googleMapsUrl" placeholder="Coller un lien Google Maps..." class="flex-1 w-full" />
          <UButton variant="solid" @click="extractCoords">Extraire</UButton>
        </div>
        <p v-if="coordsError" class="text-error text-xs mt-1">{{ coordsError }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-muted mb-1">Latitude</label>
          <UInput v-model="latInput" class="w-full" @blur="onLatBlur" />
        </div>
        <div>
          <label class="block text-sm text-muted mb-1">Longitude</label>
          <UInput v-model="lonInput" class="w-full" @blur="onLonBlur" />
        </div>
      </div>
      <p class="text-xs text-dimmed">Cliquez sur la carte, collez un lien Google Maps ou saisissez les coordonnées</p>

      <div class="flex gap-3 pt-1">
        <UButton type="submit" :disabled="!isValid || loading">
          {{ loading ? "..." : submitLabel }}
        </UButton>
        <UButton variant="solid" color="neutral" @click="emit('cancel')">Annuler</UButton>
      </div>

      <p v-if="error" class="text-error text-sm">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CreatePoiInput, PoiTypeRecord, PoiDifficultyRecord } from "~~/types/poi";
import { typeLabel, difficultyLabel, parseGoogleMapsUrl } from "~/utils/i18n";

const props = defineProps<{
  initialData?: {
    name: string;
    type: string;
    difficulty: string;
    lat: number;
    lon: number;
  };
  poiTypes: PoiTypeRecord[];
  poiDifficulties: PoiDifficultyRecord[];
  title: string;
  submitLabel: string;
  loading?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  submit: [data: CreatePoiInput];
  cancel: [];
  coordsChanged: [coords: { lat: number; lon: number }];
}>();

const googleMapsUrl = ref("");
const coordsError = ref("");

const latInput = ref(props.initialData?.lat?.toFixed(7) ?? "");
const lonInput = ref(props.initialData?.lon?.toFixed(7) ?? "");

const form = reactive({
  name: props.initialData?.name ?? "",
  type: props.initialData?.type ?? props.poiTypes[0]?.slug ?? "",
  difficulty: props.initialData?.difficulty ?? props.poiDifficulties[0]?.slug ?? "",
  lat: props.initialData?.lat ?? null as number | null,
  lon: props.initialData?.lon ?? null as number | null,
});

const typeOptions = computed(() =>
  props.poiTypes.map((t) => ({ label: typeLabel(t.slug), value: t.slug }))
);
const difficultyOptions = computed(() =>
  props.poiDifficulties.map((d) => ({ label: difficultyLabel(d.slug), value: d.slug }))
);

const isValid = computed(
  () => form.name.trim() !== "" && form.lat !== null && form.lon !== null
);

function onLatBlur() {
  const v = parseFloat(latInput.value);
  if (!isNaN(v) && v >= -90 && v <= 90) {
    form.lat = v;
    latInput.value = v.toFixed(7);
    if (form.lon !== null) emit("coordsChanged", { lat: v, lon: form.lon });
  } else if (form.lat !== null) {
    latInput.value = form.lat.toFixed(7);
  }
}

function onLonBlur() {
  const v = parseFloat(lonInput.value);
  if (!isNaN(v) && v >= -180 && v <= 180) {
    form.lon = v;
    lonInput.value = v.toFixed(7);
    if (form.lat !== null) emit("coordsChanged", { lat: form.lat, lon: v });
  } else if (form.lon !== null) {
    lonInput.value = form.lon.toFixed(7);
  }
}

function extractCoords() {
  coordsError.value = "";
  const result = parseGoogleMapsUrl(googleMapsUrl.value);
  if (!result) {
    coordsError.value = "Impossible d'extraire les coordonnees de ce lien";
    return;
  }
  form.lat = result.lat;
  form.lon = result.lon;
  latInput.value = result.lat.toFixed(7);
  lonInput.value = result.lon.toFixed(7);
  emit("coordsChanged", result);
}

function setCoords(lat: number, lon: number) {
  form.lat = lat;
  form.lon = lon;
  latInput.value = lat.toFixed(7);
  lonInput.value = lon.toFixed(7);
}

function handleSubmit() {
  if (!isValid.value) return;
  emit("submit", {
    name: form.name.trim(),
    type: form.type,
    difficulty: form.difficulty,
    lat: form.lat!,
    lon: form.lon!,
  });
}

defineExpose({ setCoords });
</script>
