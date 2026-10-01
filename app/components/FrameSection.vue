<template>
  <div class="space-y-6">
    <!-- Les 8 morceaux à leur place, l'assemblage au milieu -->
    <div class="grid gap-3 max-w-3xl" style="grid-template-columns: repeat(3, minmax(150px, 1fr))">
      <template v-for="cell in CELLS" :key="cell">
        <div v-if="cell === 'center'" class="relative rounded-lg border border-default checker min-h-40">
          <FrameArt :pieces="pieces" :scale="2" :fill="fills[theme]" />
          <!-- Rien déposé : le message au centre ; assemblage partiel : discret, en bas -->
          <span
            v-if="!complete"
            class="absolute left-0 right-0 flex justify-center text-xs text-dimmed text-center px-4"
            :class="empty ? 'inset-y-0 items-center' : 'bottom-2'"
          >
            {{ missingLabel }}
          </span>
        </div>
        <IconCard
          v-else-if="bySlot[cell]"
          :item="bySlot[cell]!"
          :api-base="apiBase"
          :can-integrate="canIntegrate"
          @updated="(item) => emit('updated', item)"
        />
      </template>
    </div>

    <!-- Le même cadre à plusieurs tailles : c'est là qu'un raccord raté se voit -->
    <div class="space-y-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium">Aperçu à plusieurs tailles</span>
        <UButton
          v-for="t in THEMES"
          :key="t.id"
          size="xs"
          :variant="theme === t.id ? 'solid' : 'outline'"
          :color="theme === t.id ? 'primary' : 'neutral'"
          :icon="t.icon"
          @click="() => { theme = t.id }"
        >
          {{ t.label }}
        </UButton>
      </div>
      <div class="flex flex-wrap items-start gap-4">
        <div
          v-for="s in SIZES"
          :key="s.label"
          class="relative checker rounded"
          :style="{ width: `${s.w}px`, height: `${s.h}px` }"
          :title="s.label"
        >
          <FrameArt :pieces="pieces" :scale="2" :fill="fills[theme]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconCategory, IconItem } from "~~/types/poi";
import type { FrameSlot } from "~/utils/frameArt";

/**
 * Section « Cadre » de la page graphiste : les 8 morceaux disposés comme dans le cadre, et
 * l'assemblage en direct — au centre de la grille, puis à plusieurs tailles et dans les deux
 * thèmes de l'app (le fond de la fenêtre change, pas les morceaux). Affichage ×2, sans lissage.
 */
const props = defineProps<{ category: IconCategory; apiBase: string; canIntegrate: boolean }>();
const emit = defineEmits<{ updated: [item: IconItem] }>();

const CELLS: Array<FrameSlot | "center"> = [
  "corner-tl", "edge-top", "corner-tr",
  "edge-left", "center", "edge-right",
  "corner-bl", "edge-bottom", "corner-br",
];

/** Une barre basse et large, une fenêtre, une colonne : les trois formes du jeu. */
const SIZES = [
  { label: "Barre", w: 360, h: 88 },
  { label: "Fenêtre", w: 260, h: 200 },
  { label: "Colonne", w: 140, h: 260 },
];

const THEMES = [
  { id: "light", label: "Clair", icon: "i-lucide-sun" },
  { id: "dark", label: "Sombre", icon: "i-lucide-moon" },
] as const;
const theme = ref<"light" | "dark">("light");
/** Le fond des fenêtres de l'app (`panelBg`), dans chaque thème. */
const fills = { light: MOCK_PALETTES.light.panelBg, dark: MOCK_PALETTES.dark.panelBg };

const bySlot = computed(() => Object.fromEntries(props.category.items.map((i) => [i.slug, i])) as Partial<Record<FrameSlot, IconItem>>);

const pieces = computed(() => framePieces(props.category, props.apiBase));
const complete = computed(() => isFrameComplete(pieces.value));
const missing = computed(() => FRAME_SLOTS.filter((s) => !pieces.value[s]).length);
const empty = computed(() => missing.value === FRAME_SLOTS.length);
const missingLabel = computed(() =>
  empty.value ? "L'assemblage s'affiche ici au fil des dépôts" : `Il manque ${missing.value} morceau${missing.value > 1 ? "x" : ""}`,
);
</script>

<style scoped>
.checker {
  background-color: #231b14;
  background-image:
    linear-gradient(45deg, #2c2219 25%, transparent 25%, transparent 75%, #2c2219 75%),
    linear-gradient(45deg, #2c2219 25%, transparent 25%, transparent 75%, #2c2219 75%);
  background-size: 16px 16px;
  background-position: 0 0, 8px 8px;
}
</style>
