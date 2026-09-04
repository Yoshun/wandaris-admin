<template>
  <figure class="flex flex-col items-center gap-3 shrink-0 m-0">
    <div class="phone" :style="{ width: `${width}px`, height: `${height}px` }">
      <div class="statusbar" />
      <div class="screen">
        <slot />
      </div>
    </div>
    <figcaption class="text-sm text-muted">{{ caption }}</figcaption>
    <div v-if="$slots.toolbar" class="flex gap-2 flex-wrap justify-center">
      <slot name="toolbar" />
    </div>
  </figure>
</template>

<script setup lang="ts">
/**
 * Gabarit de téléphone des maquettes : 360 DP de large, comme un Android courant, avec
 * la barre de statut de l'app (fond panelBg). Tout le texte de l'écran est en VT323,
 * la police de l'app — chargée par la page /graphiste.
 */
withDefaults(defineProps<{ caption: string; width?: number; height?: number }>(), { width: 360, height: 740 });
</script>

<style scoped>
.phone {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 8px solid #0e0a06;
  border-radius: 28px;
  overflow: hidden;
  background: #1a1410;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.statusbar {
  height: 24px;
  flex: none;
  background: #1a1410;
}
.screen {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  font-family: "VT323", "Courier New", monospace;
  color: #c8b898;
  user-select: none;
}
</style>
