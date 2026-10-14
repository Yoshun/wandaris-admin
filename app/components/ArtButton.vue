<template>
  <div class="ab" :style="boxStyle">
    <img :src="src" alt="" class="ab-art" draggable="false" />
    <span class="ab-content" :style="contentStyle">
      <img v-if="icon" :src="icon" alt="" class="ab-icon" :style="iconStyle" />
      <span class="ab-label" :style="labelStyle">{{ label }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ButtonArt, ButtonSize, ButtonVariant } from "~/utils/buttonArt";
import type { MockTheme } from "~/utils/mockIcons";

/**
 * Un bouton de la graphiste, à la taille de son dessin : le gris du centre remplacé par la
 * couleur du bouton (règle dans `utils/buttonArt.ts`), le libellé centré par-dessus, sur une
 * ligne. Un libellé trop long déborde : c'est voulu, l'aperçu doit le montrer.
 *
 * En attendant la lecture des pixels (ou si elle échoue), le dessin s'affiche tel quel, gris.
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
  }>(),
  { variant: "primary", disabled: false, icon: null, scale: 1 },
);

const colors = computed(() => buttonColors(MOCK_PALETTES[props.theme], props.variant, props.disabled));

const src = ref(props.art.url);
watch(
  () => [props.art.pixelsUrl, colors.value.fill] as const,
  ([pixelsUrl, fill]) => {
    tintedUrl(pixelsUrl, fill)
      .then((url) => {
        // Une réponse arrivée après un changement de thème ou de dépôt ne doit pas écraser la bonne
        if (pixelsUrl === props.art.pixelsUrl && fill === colors.value.fill) src.value = url;
      })
      .catch((err) => {
        src.value = props.art.url;
        console.warn("Bouton non recoloré :", err);
      });
  },
  { immediate: true },
);

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
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
}
.ab-icon {
  image-rendering: pixelated;
}
</style>
