<template>
  <figure
    class="relative flex flex-col gap-2 bg-elevated border rounded-lg p-3 pt-4 transition-colors"
    :class="dragging ? 'border-primary ring-2 ring-primary/40' : 'border-default'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <span class="absolute inset-x-0 top-0 h-1 rounded-t-lg" :class="stripeClass" />

    <div class="h-28 flex items-center justify-center rounded checker">
      <img
        v-if="item.url"
        :src="`${apiBase}${item.url}`"
        :alt="item.label"
        class="w-20 h-20 object-contain"
        :class="{ pixelated: item.generated || item.status !== 'placeholder' }"
      />
      <span v-else class="text-dimmed text-xs">Aucun visuel</span>
    </div>

    <figcaption class="min-w-0">
      <div class="font-medium leading-tight">{{ item.label }}</div>
      <div class="text-xs text-dimmed font-mono truncate">{{ item.slug }}</div>
      <div v-if="item.note" class="text-xs text-muted mt-1">{{ item.note }}</div>
    </figcaption>

    <div class="flex items-center justify-between gap-2 mt-auto">
      <UBadge :color="badge.color" variant="subtle" size="sm">{{ badge.label }}</UBadge>
      <span v-if="item.width" class="text-xs text-dimmed tabular-nums">{{ item.width }}×{{ item.height }}</span>
    </div>
    <div v-if="item.uploadedAt" class="text-xs text-dimmed">{{ dateLabel }} · {{ item.uploadedBy }}</div>

    <div class="flex gap-1">
      <UButton
        size="xs"
        icon="i-lucide-upload"
        :variant="item.status === 'integrated' ? 'outline' : 'solid'"
        :color="item.status === 'integrated' ? 'neutral' : 'primary'"
        :loading="busy"
        @click="input?.click()"
      >
        {{ item.url ? "Remplacer" : "Déposer" }}
      </UButton>
      <UButton
        v-if="canIntegrate && item.status === 'delivered'"
        size="xs"
        variant="outline"
        color="success"
        icon="i-lucide-check"
        :loading="busy"
        @click="markIntegrated"
      >
        Intégrée
      </UButton>
    </div>

    <input ref="input" type="file" accept="image/png" class="hidden" @change="onChange" />
  </figure>
</template>

<script setup lang="ts">
import type { IconItem } from "~~/types/poi";

const props = defineProps<{
  item: IconItem;
  apiBase: string;
  canIntegrate: boolean;
}>();
const emit = defineEmits<{ updated: [item: IconItem] }>();

const { upload, integrate } = useIconsApi();
const toast = useToast();

const input = ref<HTMLInputElement>();
const busy = ref(false);
const dragging = ref(false);

const BADGES: Record<IconItem["status"], { label: string; color: "success" | "warning" | "error" | "info" | "neutral"; stripe: string }> = {
  integrated: { label: "Dans l'app", color: "success", stripe: "bg-success" },
  delivered: { label: "Déposée, à intégrer", color: "warning", stripe: "bg-warning" },
  placeholder: { label: "Provisoire, à refaire", color: "error", stripe: "bg-error" },
  missing: { label: "À créer", color: "neutral", stripe: "bg-neutral-600" },
  generated: { label: "Générée, à valider", color: "error", stripe: "bg-error" },
};

const badge = computed(() => {
  const b = BADGES[props.item.status];
  // Un glyphe généré par script n'est pas validé : tant que le graphiste ne l'a pas
  // remplacé (statut « integrated » après pull), il reste rouge, à refaire.
  if (props.item.generated && props.item.status === "placeholder") return { ...b, label: "Générée, à valider" };
  return b;
});
const stripeClass = computed(() => BADGES[props.item.status].stripe);

const dateLabel = computed(() => {
  if (!props.item.uploadedAt) return "";
  return new Date(props.item.uploadedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
});

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) send(file);
  if (input.value) input.value.value = "";
}

function onDrop(e: DragEvent) {
  dragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) send(file);
}

async function send(file: File) {
  if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
    toast.add({ title: "PNG uniquement", description: file.name, color: "error" });
    return;
  }
  busy.value = true;
  try {
    const { warnings, ...updated } = await upload(props.item.category, props.item.slug, file);
    emit("updated", updated);
    toast.add({
      title: `${props.item.label} déposée`,
      description: warnings.length ? warnings.join(" · ") : undefined,
      color: warnings.length ? "warning" : "success",
    });
  } catch (err: any) {
    toast.add({ title: "Dépôt refusé", description: err.message, color: "error" });
  } finally {
    busy.value = false;
  }
}

async function markIntegrated() {
  busy.value = true;
  try {
    emit("updated", await integrate(props.item.category, props.item.slug));
  } catch (err: any) {
    toast.add({ title: "Impossible de marquer l'icône", description: err.message, color: "error" });
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.pixelated {
  image-rendering: pixelated;
}
.checker {
  background-color: #231b14;
  background-image:
    linear-gradient(45deg, #2c2219 25%, transparent 25%, transparent 75%, #2c2219 75%),
    linear-gradient(45deg, #2c2219 25%, transparent 25%, transparent 75%, #2c2219 75%);
  background-size: 16px 16px;
  background-position: 0 0, 8px 8px;
}
</style>
