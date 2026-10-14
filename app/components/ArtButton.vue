<template>
  <div class="ab" :style="boxStyle">
    <img :src="src" alt="" class="ab-art" draggable="false" :style="artStyle" />
    <span class="ab-content" :style="contentStyle">
      <img v-if="icon" :src="icon" alt="" class="ab-icon" :style="iconStyle" />
      <span class="ab-label" :style="labelStyle">{{ label }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ButtonArt, ButtonSize, ButtonTexture, ButtonVariant } from "~/utils/buttonArt";
// Import explicite : la valeur par défaut d'une prop est hissée hors de `setup`
import { BUTTON_TEXTURE } from "~/utils/buttonArt";
import type { MockTheme } from "~/utils/mockIcons";

/**
 * Un bouton de la graphiste, à la taille de son dessin : le gris du centre remplacé par la
 * couleur du bouton (règle dans `utils/buttonArt.ts`), le libellé centré par-dessus, sur une
 * ligne. Un libellé trop long déborde : c'est voulu, l'aperçu doit le montrer.
 *
 * En attendant la lecture des pixels (ou si elle échoue), le dessin s'affiche tel quel, gris.
 * Grisé : tout le dessin estompé, libellé opaque (voir `utils/buttonArt.ts`).
 */
const props = withDefaults(
  defineProps<{
    art: ButtonArt;
    size: ButtonSize;
    label: string;
    theme: MockTheme;
    variant?: ButtonVariant;
    disabled?: boolean;
    icon?: string | null;
    /** Pixels CSS par pixel de l'art (et par DP pour le libellé). */
    scale?: number;
    /** Texture du centre en code : celle de l'app par défaut, une autre pour comparer. */
    texture?: ButtonTexture;
  }>(),
  { variant: "primary", disabled: false, icon: null, scale: 1, texture: BUTTON_TEXTURE },
);

const colors = computed(() => buttonColors(MOCK_PALETTES[props.theme], props.variant, props.disabled));

const src = ref(props.art.url);
watch(
  () => [props.art.pixelsUrl, colors.value.fill, props.texture] as const,
  ([pixelsUrl, fill, kind]) => {
    tintedUrl(pixelsUrl, fill, kind)
      .then((url) => {
        // Une réponse arrivée après un changement de thème, de texture ou de dépôt ne doit pas écraser la bonne
        if (pixelsUrl === props.art.pixelsUrl && fill === colors.value.fill && kind === props.texture) src.value = url;
      })
      .catch((err) => {
        src.value = props.art.url;
        console.warn("Bouton non recoloré :", err);
      });
  },
  { immediate: true },
);

const artStyle = computed(() => ({ opacity: props.disabled ? DISABLED_ART_OPACITY : 1 }));
const boxStyle = computed(() => ({
  width: `${props.art.width * props.scale}px`,
  height: `${props.art.height * props.scale}px`,
}));
const contentStyle = computed(() => ({ gap: `${6 * props.scale}px` }));
const labelStyle = computed(() => ({ color: colors.value.text, fontSize: `${BUTTON_FONT[props.size] * props.scale}px` }));
const iconStyle = computed(() => {
  const size = (props.size === "small" ? 16 : 20) * props.scale;
  return { width: `${size}px`, height: `${size}px`, opacity: props.disabled ? 0.5 : 1 };
});
</script>

<style scoped>
.ab {
  position: relative;
  flex-shrink: 0;
}
.ab-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  image-rendering: pixelated;
  user-select: none;
}
.ab-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ab-label {
  font-family: "VT323", monospace;
  /* Pas de gras : VT323 n'a qu'une graisse, et sur Android `PixelText` retire le gras du libellé de `CandyButton` */
  font-weight: normal;
  font-synthesis: none;
  line-height: 1;
  white-space: nowrap;
}
.ab-icon {
  image-rendering: pixelated;
}
</style>
