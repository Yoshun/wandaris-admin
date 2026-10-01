<template>
  <div class="ab" :class="{ 'ab-full': fullWidth }" :style="boxStyle">
    <FrameArt :pieces="pieces" :scale="scale" :fill="colors.fill" :piece-filter="disabled ? 'grayscale(1)' : undefined" />
    <img v-if="icon" :src="icon" alt="" class="ab-icon" :style="iconStyle" />
    <span class="ab-label" :style="labelStyle">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { FramePieces } from "~/utils/frameArt";

/**
 * Un bouton assemblé à partir des 8 morceaux de la graphiste, selon la règle du cadre : la
 * bordure est son dessin, le centre est la couleur du bouton (variables `--btn-*` de la
 * palette de l'app, à fournir par un parent). Le libellé est posé dans le centre, avec une
 * marge intérieure fixe — indicative : les vraies valeurs seront fixées à l'intégration.
 *
 * Grisé : les morceaux passent en niveaux de gris (filtre CSS), le centre et le libellé
 * prennent les couleurs « disabled » de l'app.
 */
const props = withDefaults(
  defineProps<{
    pieces: FramePieces;
    label: string;
    variant?: "primary" | "secondary" | "danger";
    small?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: string | null;
    /** Pixels CSS par pixel de l'art (et par DP pour le libellé et les marges). */
    scale?: number;
  }>(),
  { variant: "primary", small: false, disabled: false, fullWidth: false, icon: null, scale: 1 },
);

/** Mêmes jetons que `CandyButton` côté app. */
const colors = computed(() => {
  const v = props.variant;
  if (props.disabled && v !== "secondary") {
    return v === "danger"
      ? { fill: "var(--danger-disabled-bg)", text: "var(--danger-disabled-text)" }
      : { fill: "var(--btn-disabled-bg)", text: "var(--btn-disabled-text)" };
  }
  if (v === "danger") return { fill: "var(--danger-bg)", text: "var(--danger-text)" };
  if (v === "secondary") return { fill: "var(--sec-btn-bg)", text: "var(--sec-btn-text)" };
  return { fill: "var(--btn-bg)", text: "var(--btn-text)" };
});

/** Épaisseur de bordure de chaque bord, en pixels de l'art : celle des côtés. */
const border = computed(() => ({
  top: props.pieces["edge-top"]?.height ?? 0,
  bottom: props.pieces["edge-bottom"]?.height ?? 0,
  left: props.pieces["edge-left"]?.width ?? 0,
  right: props.pieces["edge-right"]?.width ?? 0,
}));

/** Marge entre la bordure et le libellé, en DP. */
const inner = computed(() => (props.small ? { x: 6, y: 3 } : { x: 8, y: 4 }));

const boxStyle = computed(() => {
  const s = props.scale;
  return {
    padding: `${(border.value.top + inner.value.y) * s}px ${(border.value.right + inner.value.x) * s}px ${(border.value.bottom + inner.value.y) * s}px ${(border.value.left + inner.value.x) * s}px`,
    gap: `${6 * s}px`,
  };
});
const labelStyle = computed(() => ({ color: colors.value.text, fontSize: `${(props.small ? 14 : 17) * props.scale}px` }));
const iconStyle = computed(() => {
  const size = (props.small ? 16 : 20) * props.scale;
  return { width: `${size}px`, height: `${size}px`, opacity: props.disabled ? 0.5 : 1 };
});
</script>

<style scoped>
.ab {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ab-full {
  display: flex;
  width: 100%;
}
.ab-label,
.ab-icon {
  position: relative;
  z-index: 2;
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
