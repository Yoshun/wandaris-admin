<template>
  <!-- Le bouton de la graphiste dès que l'ensemble de sa taille est complet, à 1 DP par pixel de l'art -->
  <ArtButton
    v-if="art"
    :pieces="pieces"
    :label="label"
    :variant="variant"
    :small="small"
    :disabled="disabled"
    :full-width="fullWidth"
    :icon="icon"
  />
  <div v-else class="cb" :class="[`cb-${variant}`, { 'cb-small': small, 'cb-full': fullWidth, 'cb-disabled': disabled }]">
    <img v-if="icon" :src="icon" alt="" class="cb-icon" />
    <span class="cb-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import type { FramePieces } from "~/utils/frameArt";

/**
 * Portage CSS de `CandyButton` : fond plein + bordure épaisse en bas et à droite qui fait
 * le relief, carré, sans asset. Même gabarit que l'app (20 DP de chrome vertical, 18 en
 * `small`). Le placeholder, en attendant l'art du bouton.
 *
 * Dès que les 8 morceaux du bouton de sa taille sont déposés (catégories « Gros bouton » /
 * « Petit bouton » de la page graphiste), `ArtButton` les assemble à la place.
 */
const props = withDefaults(
  defineProps<{
    label: string;
    variant?: "primary" | "secondary" | "danger";
    small?: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    icon?: string | null;
  }>(),
  { variant: "primary", small: false, fullWidth: false, disabled: false, icon: null },
);

const sets = inject(MOCK_BUTTON_KEY, ref({ big: {} as FramePieces, small: {} as FramePieces }));
const pieces = computed(() => (props.small ? sets.value.small : sets.value.big));
const art = computed(() => isFrameComplete(pieces.value));
</script>

<style scoped>
.cb {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-bottom: 4px solid;
  border-right: 4px solid;
}
.cb-small {
  padding: 8px 12px 7px;
  border-bottom-width: 3px;
  border-right-width: 3px;
}
.cb-full { display: flex; width: 100%; }
.cb-primary { background: var(--btn-bg); border-color: var(--btn-border); }
.cb-primary .cb-label { color: var(--btn-text); }
.cb-secondary { background: var(--sec-btn-bg); border-color: var(--sec-btn-border); }
.cb-secondary .cb-label { color: var(--sec-btn-text); }
.cb-danger { background: var(--danger-bg); border-color: var(--danger-border); }
.cb-danger .cb-label { color: var(--danger-text); }
.cb-primary.cb-disabled { background: var(--btn-disabled-bg); border-color: var(--btn-disabled-border); }
.cb-primary.cb-disabled .cb-label { color: var(--btn-disabled-text); }
.cb-danger.cb-disabled { background: var(--danger-disabled-bg); border-color: var(--danger-disabled-border); }
.cb-danger.cb-disabled .cb-label { color: var(--danger-disabled-text); }
.cb-label {
  font-family: "VT323", monospace;
  font-size: 17px;
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
}
.cb-small .cb-label { font-size: 14px; }
.cb-icon { width: 20px; height: 20px; }
.cb-small .cb-icon { width: 16px; height: 16px; }
.cb-disabled .cb-icon { opacity: 0.5; }
</style>
