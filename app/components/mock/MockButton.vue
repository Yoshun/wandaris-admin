<template>
  <div class="cb" :class="{ 'cb-small': small, 'cb-full': fullWidth, 'cb-disabled': disabled }">
    <div class="cb-fond" :style="{ background: fond }" />
    <div class="cb-edge cb-top"><img :src="'/mock/btn-e-top.png'" alt="" /></div>
    <div class="cb-edge cb-bottom"><img :src="'/mock/btn-e-bottom.png'" alt="" /></div>
    <div class="cb-edge cb-left"><img :src="'/mock/btn-e-left.png'" alt="" /></div>
    <div class="cb-edge cb-right"><img :src="'/mock/btn-e-right.png'" alt="" /></div>
    <img class="cb-corner cb-tl" :src="'/mock/btn-tl.png'" alt="" />
    <img class="cb-corner cb-tr" :src="'/mock/btn-tr.png'" alt="" />
    <img class="cb-corner cb-bl" :src="'/mock/btn-bl.png'" alt="" />
    <img class="cb-corner cb-br" :src="'/mock/btn-br.png'" alt="" />
    <div class="cb-face">
      <img v-if="icon" :src="icon" alt="" class="cb-icon" />
      <span class="cb-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Portage CSS de `CandyButton` : bordure 9-slice de 12 DP, fond en escalier (crans de
 * 2 DP aux coins, jamais de rayon), libellé posé sur la face visible (décalé vers le haut,
 * la bordure du bas étant plus épaisse).
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

const FONDS = { primary: "#5C7064", secondary: "#514B43", danger: "#6E2E2B" } as const;
const fond = computed(() => (props.disabled ? "#aeb4a0" : FONDS[props.variant]));
</script>

<style scoped>
.cb {
  position: relative;
  display: inline-flex;
  padding: 10px 15px;
  min-width: 48px;
}
.cb-small { padding: 9px 14px; }
.cb-full { display: flex; width: 100%; }
.cb-fond {
  position: absolute;
  inset: 0;
  clip-path: polygon(
    4px 0, calc(100% - 4px) 0, calc(100% - 4px) 2px, calc(100% - 2px) 2px, calc(100% - 2px) 4px, 100% 4px,
    100% calc(100% - 4px), calc(100% - 2px) calc(100% - 4px), calc(100% - 2px) calc(100% - 2px), calc(100% - 4px) calc(100% - 2px),
    calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 2px), 2px calc(100% - 2px), 2px calc(100% - 4px), 0 calc(100% - 4px),
    0 4px, 2px 4px, 2px 2px, 4px 2px
  );
}
.cb-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  image-rendering: pixelated;
  z-index: 2;
}
.cb-tl { top: 0; left: 0; }
.cb-tr { top: 0; right: 0; }
.cb-bl { bottom: 0; left: 0; }
.cb-br { bottom: 0; right: 0; }
.cb-edge { position: absolute; z-index: 1; }
.cb-edge img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
.cb-top { top: 0; left: 11px; right: 11px; height: 12px; }
.cb-bottom { bottom: 0; left: 11px; right: 11px; height: 12px; }
.cb-left { left: 0; top: 11px; bottom: 11px; width: 12px; }
.cb-right { right: 0; top: 11px; bottom: 11px; width: 12px; }
.cb-face {
  position: relative;
  z-index: 3;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transform: translate(-1px, -5px);
}
.cb-label {
  font-family: "VT323", monospace;
  font-size: 17px;
  font-weight: bold;
  line-height: 1;
  color: #f0e6d2;
  white-space: nowrap;
}
.cb-small .cb-label { font-size: 14px; }
.cb-disabled .cb-label { color: #807c6e; }
.cb-icon { width: 20px; height: 20px; }
.cb-small .cb-icon { width: 16px; height: 16px; }
.cb-disabled .cb-icon { opacity: 0.5; }
</style>
