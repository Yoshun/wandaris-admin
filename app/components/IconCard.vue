<template>
  <figure
    class="flex flex-col gap-2 bg-elevated border rounded-lg p-3 transition-colors"
    :class="dragging ? 'border-primary ring-2 ring-primary/40' : 'border-default'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <div class="h-24 flex items-center justify-center rounded checker">
      <img
        v-if="item.url"
        :src="`${apiBase}${item.url}`"
        :alt="item.label"
        class="w-16 h-16 object-contain"
        :class="{ pixelated: item.status !== 'placeholder' }"
      />
      <span v-else class="text-dimmed text-xs">Aucun visuel</span>
    </div>

    <figcaption class="min-w-0">
      <div class="font-medium leading-tight">{{ item.label }}</div>
      <div v-if="item.note" class="text-xs text-muted mt-1">{{ item.note }}</div>
    </figcaption>

    <div class="flex items-center justify-between gap-2 mt-auto">
      <span class="text-xs flex items-center gap-1.5" :class="state.class">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-current" />
        {{ state.label }}
      </span>
      <div class="flex gap-1">
        <UButton
          v-if="canIntegrate && item.status === 'delivered'"
          size="xs"
          variant="outline"
          color="success"
          icon="i-lucide-check"
          :loading="busy"
          aria-label="Marquer comme intégrée"
          @click="markIntegrated"
        />
        <UButton
          size="xs"
          icon="i-lucide-upload"
          :variant="item.status === 'integrated' ? 'outline' : 'solid'"
          :color="item.status === 'integrated' ? 'neutral' : 'primary'"
          :loading="busy"
          @click="input?.click()"
        >
          Déposer
        </UButton>
      </div>
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

/** Un mot, une couleur : où en est cette icône. Le provisoire est le visuel qui tient la place, pas le style attendu. */
const STATES: Record<IconItem["status"], { label: string; class: string }> = {
  placeholder: { label: "Provisoire", class: "text-muted" },
  missing: { label: "À créer", class: "text-muted" },
  delivered: { label: "Déposée", class: "text-warning" },
  integrated: { label: "Dans l'app", class: "text-success" },
};
const state = computed(() => STATES[props.item.status]);

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
