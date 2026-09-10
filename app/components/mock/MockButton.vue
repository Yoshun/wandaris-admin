<template>
  <div class="cb" :class="[`cb-${variant}`, { 'cb-small': small, 'cb-full': fullWidth, 'cb-disabled': disabled }]">
    <img v-if="icon" :src="icon" alt="" class="cb-icon" />
    <span class="cb-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * Portage CSS de `CandyButton` : fond plein + bordure épaisse en bas et à droite qui fait
 * le relief, carré, sans asset. Même gabarit que l'app (20 DP de chrome vertical, 18 en
 * `small`). Le placeholder, en attendant l'art du bouton.
 */
withDefaults(
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
.cb-primary { background: #6b4c32; border-color: #3d2a18; }
.cb-primary .cb-label { color: #f0e6d2; }
.cb-secondary { background: #2a2218; border-color: #000; }
.cb-secondary .cb-label { color: #c8b898; }
.cb-danger { background: #7a2222; border-color: #4a1010; }
.cb-danger .cb-label { color: #f0e6d2; }
.cb-primary.cb-disabled { background: #3a3028; border-color: #2a2018; }
.cb-primary.cb-disabled .cb-label { color: #8a7a68; }
.cb-danger.cb-disabled { background: #4a2020; border-color: #2a1010; }
.cb-danger.cb-disabled .cb-label { color: #8a6060; }
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
