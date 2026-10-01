<template>
  <div class="space-y-6">
    <!-- Les 8 morceaux à leur place, l'assemblage au milieu -->
    <div class="grid gap-3 max-w-3xl" style="grid-template-columns: repeat(3, minmax(150px, 1fr))">
      <template v-for="cell in CELLS" :key="cell">
        <div
          v-if="cell === 'center'"
          class="relative rounded-lg border border-default min-h-40 flex items-center justify-center p-3"
          :class="{ checker: !isButton }"
          :style="isButton ? { ...vars, background: 'var(--panel-bg)' } : undefined"
        >
          <FrameArt v-if="!isButton" :pieces="pieces" :scale="2" :fill="fills[theme]" />
          <ArtButton v-else-if="!empty" :pieces="pieces" :small="small" :label="small ? 'Fuir' : 'Combattre'" :scale="2" />
          <!-- Rien déposé : le message au centre ; assemblage partiel : discret, en bas -->
          <span
            v-if="!complete"
            class="absolute left-0 right-0 flex justify-center text-xs text-center px-4"
            :class="[empty ? 'inset-y-0 items-center' : 'bottom-2', isButton ? 'text-[var(--subtitle-text)]' : 'text-dimmed']"
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

    <!-- Le même assemblage en situation : c'est là qu'un raccord raté se voit -->
    <div class="space-y-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium">{{ isButton ? "Aperçu des boutons" : "Aperçu à plusieurs tailles" }}</span>
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

      <div v-if="!isButton" class="flex flex-wrap items-start gap-4">
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

      <!-- Les boutons sur le fond d'une fenêtre : les trois couleurs, le grisé, la pleine largeur -->
      <div v-else class="rounded-lg p-4 space-y-4 max-w-3xl" :style="{ ...vars, background: 'var(--panel-bg)' }">
        <div class="flex flex-wrap items-center gap-4">
          <ArtButton
            v-for="b in BUTTONS"
            :key="b.label"
            :pieces="pieces"
            :small="small"
            :label="b.label"
            :variant="b.variant"
            :disabled="b.disabled"
            :scale="2"
          />
        </div>
        <ArtButton :pieces="pieces" :small="small" :label="small ? 'Retour' : 'Valider'" full-width :scale="2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconCategory, IconItem } from "~~/types/poi";
import type { FrameSlot } from "~/utils/frameArt";

/**
 * Section d'un assemblage en 8 morceaux sur la page graphiste — le cadre des fenêtres, le
 * gros et le petit bouton. Les morceaux sont disposés comme dans l'assemblage, qui s'affiche
 * en direct au centre puis en situation : le cadre à plusieurs tailles, les boutons dans
 * leurs trois couleurs, grisés et en pleine largeur, sur le fond d'une fenêtre. Dans les deux
 * thèmes de l'app (le fond change, pas les morceaux). Affichage ×2, sans lissage.
 */
const props = defineProps<{ category: IconCategory; apiBase: string; canIntegrate: boolean }>();
const emit = defineEmits<{ updated: [item: IconItem] }>();

const isButton = computed(() => props.category.id === "button" || props.category.id === "button-small");
const small = computed(() => props.category.id === "button-small");

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

const BUTTONS = computed(() =>
  small.value
    ? [
        { label: "Fuir", variant: "primary" as const, disabled: false },
        { label: "Retour", variant: "secondary" as const, disabled: false },
        { label: "Jeter", variant: "danger" as const, disabled: false },
        { label: "120 or", variant: "primary" as const, disabled: true },
      ]
    : [
        { label: "Combattre", variant: "primary" as const, disabled: false },
        { label: "Annuler", variant: "secondary" as const, disabled: false },
        { label: "Supprimer", variant: "danger" as const, disabled: false },
        { label: "Acheter", variant: "primary" as const, disabled: true },
      ],
);

const THEMES = [
  { id: "light", label: "Clair", icon: "i-lucide-sun" },
  { id: "dark", label: "Sombre", icon: "i-lucide-moon" },
] as const;
const theme = ref<"light" | "dark">("light");
/** Le fond des fenêtres de l'app (`panelBg`), dans chaque thème. */
const fills = { light: MOCK_PALETTES.light.panelBg, dark: MOCK_PALETTES.dark.panelBg };
/** La palette de l'app en variables CSS, pour les couleurs des boutons. */
const vars = computed(() => paletteVars(theme.value));

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
