<template>
  <div class="space-y-6">
    <!-- Les trois dépôts : la carte est assez large pour le grand bouton à sa taille réelle -->
    <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(290px, 1fr))">
      <IconCard
        v-for="item in category.items"
        :key="`${item.category}/${item.slug}`"
        :item="item"
        :api-base="apiBase"
        :can-integrate="canIntegrate"
        @updated="(it) => emit('updated', it)"
      />
    </div>

    <div class="space-y-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-medium">Aperçu des boutons</span>
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
      <!-- Essai de texture du centre en code : admins seulement, tant que ce n'est pas une règle -->
      <div v-if="isAdmin" class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-muted">Essai — texture du centre en code (visible des admins seulement)</span>
        <UButton
          v-for="t in BUTTON_TEXTURES"
          :key="t.id"
          size="xs"
          :variant="tex === t.id ? 'solid' : 'outline'"
          :color="tex === t.id ? 'primary' : 'neutral'"
          @click="() => { tex = t.id }"
        >
          {{ t.label }}
        </UButton>
      </div>

      <!-- Sur le fond d'une fenêtre de l'app, dans le thème choisi -->
      <div class="rounded-lg p-4 space-y-8" :style="{ background: palette.panelBg, color: palette.text }">
        <!-- Ce que devient chaque gris : le gris de référence est la couleur du bouton, exactement -->
        <div class="space-y-2">
          <div class="text-sm font-medium">Ce que devient le gris</div>
          <div class="overflow-x-auto">
            <table class="text-xs border-separate" style="border-spacing: 4px">
              <tbody>
                <tr>
                  <td class="pr-2" :style="{ color: palette.subtitleText }">Gris déposé</td>
                  <td v-for="g in GRAYS" :key="g">
                    <div class="swatch" :style="{ background: grayHex(g) }" />
                    <div class="text-center mt-1 tabular-nums" :style="{ color: g === REFERENCE_GRAY ? palette.textStrong : palette.subtitleText }">
                      {{ grayHex(g) }}
                    </div>
                  </td>
                </tr>
                <tr v-for="v in SWATCH_VARIANTS" :key="v.caption">
                  <td class="pr-2" :style="{ color: palette.subtitleText }">{{ v.caption }}</td>
                  <td v-for="g in GRAYS" :key="g">
                    <div class="swatch" :style="swatch(g, v.variant, v.disabled)" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-for="row in rows" :key="row.size" class="space-y-3">
          <div class="text-sm">
            <span class="font-medium">{{ row.title }}</span>
            <span class="ml-2 tabular-nums" :style="{ color: palette.subtitleText }">{{ row.dims }}</span>
          </div>
          <p v-for="w in row.warnings" :key="w" class="text-xs" :style="{ color: palette.errorText }">{{ w }}</p>
          <div v-if="row.art" class="flex flex-wrap gap-x-6 gap-y-4 items-start">
            <figure v-for="v in row.variants" :key="v.caption" class="space-y-1.5">
              <ArtButton
                :art="row.art"
                :size="row.size"
                :label="v.label"
                :variant="v.variant"
                :disabled="v.disabled"
                :theme="theme"
                :texture="tex"
                :scale="2"
              />
              <figcaption class="text-xs" :style="{ color: palette.subtitleText }">{{ v.caption }}</figcaption>
            </figure>
          </div>
          <p v-else class="text-xs" :style="{ color: palette.subtitleText }">S'affiche ici dès qu'il est déposé.</p>
        </div>
      </div>
      <p class="text-xs text-muted">
        Affichage ×2, sans lissage. Chaque libellé est un vrai texte de l'app ; le plus long de chaque taille y figure. Les
        maquettes de l'onglet Écrans prennent ces boutons dès qu'ils sont déposés.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconCategory, IconItem } from "~~/types/poi";
import type { ButtonArt, ButtonSize, ButtonTexture, ButtonVariant } from "~/utils/buttonArt";
import type { MockTheme } from "~/utils/mockIcons";

/**
 * Section « Boutons » de la page graphiste : les trois dépôts (grand, moyen, petit), puis
 * chaque bouton recoloré dans toutes ses variantes — normal, secondaire, rouge, grisé, rouge
 * grisé — sur le fond d'une fenêtre, dans les deux thèmes de l'app. Avant les aperçus, le
 * nuancier : ce que devient chaque gris sur chaque couleur.
 */
const props = defineProps<{ category: IconCategory; apiBase: string; canIntegrate: boolean; isAdmin: boolean }>();
const emit = defineEmits<{ updated: [item: IconItem] }>();

const THEMES = [
  { id: "light", label: "Clair", icon: "i-lucide-sun" },
  { id: "dark", label: "Sombre", icon: "i-lucide-moon" },
] as const;
const theme = ref<MockTheme>("light");
const palette = computed(() => MOCK_PALETTES[theme.value]);
const tex = ref<ButtonTexture>("none");

/** Du plus foncé au plus clair, le gris de référence au milieu. */
const GRAYS = [32, 64, 96, REFERENCE_GRAY, 160, 192, 224];
const grayHex = (g: number) => `#${g.toString(16).padStart(2, "0").repeat(3)}`;

type Variant = { caption: string; variant: ButtonVariant; disabled: boolean };
const SWATCH_VARIANTS: Variant[] = [
  { caption: "Normal", variant: "primary", disabled: false },
  { caption: "Secondaire", variant: "secondary", disabled: false },
  { caption: "Rouge", variant: "danger", disabled: false },
  { caption: "Grisé", variant: "primary", disabled: true },
  { caption: "Rouge grisé", variant: "danger", disabled: true },
];

/** La case du nuancier : le gris recoloré, estompé comme le dessin d'un bouton grisé. */
function swatch(g: number, variant: ButtonVariant, disabled: boolean) {
  const [r, gg, b] = tintGray(g, buttonColors(palette.value, variant, disabled).fill).map(Math.round);
  return { background: `rgb(${r}, ${gg}, ${b})`, opacity: disabled ? DISABLED_ART_OPACITY : 1 };
}

/**
 * Les libellés sont ceux de l'app, et chaque taille montre son plus long : « Prochaine visite
 * dans 23h 59min » est bien un grand bouton grisé (lieu en recharge), « Armures légères » un
 * choix de l'artisanat, « Fabriquer » le bouton d'une recette.
 */
const LABELS: Record<ButtonSize, string[]> = {
  large: ["Combattre", "Signaler un problème", "Supprimer le compte", "Prochaine visite dans 23h 59min", "Réinitialiser la progression"],
  medium: ["Équiper (12)", "Armures légères", "Supprimer", "Valider", "Supprimer"],
  small: ["Fabriquer", "Retour", "Recycler", "120 or", "Recycler"],
};

const TITLES: Record<ButtonSize, string> = { large: "Grand bouton", medium: "Bouton moyen", small: "Petit bouton" };

const arts = computed(() => buttonArts(props.category, props.apiBase));

/** Avertissements par taille, calculés sur les pixels du dépôt. */
const warnings = ref<Partial<Record<ButtonSize, string[]>>>({});
watch(
  arts,
  async (all) => {
    const next: Partial<Record<ButtonSize, string[]>> = {};
    await Promise.all(
      BUTTON_SIZES.map(async (size) => {
        const art = all[size];
        if (!art) return;
        next[size] = await checkArt(art);
      }),
    );
    warnings.value = next;
  },
  { immediate: true },
);

async function checkArt(art: ButtonArt): Promise<string[]> {
  const out: string[] = [];
  if (art.expected && (art.width !== art.expected.width || art.height !== art.expected.height)) {
    out.push(`Ce dessin fait ${art.width} × ${art.height} : l'app le prévoit à ${art.expected.width} × ${art.expected.height} exactement.`);
  }
  try {
    const { fill } = analyzeButton(await loadPixels(art.pixelsUrl));
    if (fill === 0) out.push("Aucun gris parfait (rouge = vert = bleu) dans ce dessin : l'app n'a rien à recolorer, tous les boutons auront la même couleur.");
  } catch {
    out.push("Lecture des pixels impossible : les aperçus montrent le dessin sans sa couleur.");
  }
  return out;
}

const rows = computed(() =>
  BUTTON_SIZES.map((size) => {
    const item = props.category.items.find((i) => i.slug === size);
    const expected = item?.size;
    return {
      size,
      title: TITLES[size],
      dims: expected ? `${expected.width} × ${expected.height}` : "",
      art: arts.value[size] ?? null,
      warnings: warnings.value[size] ?? [],
      variants: SWATCH_VARIANTS.map((v, i) => ({ ...v, label: LABELS[size][i]! })),
    };
  }),
);
</script>

<style scoped>
.swatch {
  width: 44px;
  height: 22px;
}
</style>
