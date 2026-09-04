<template>
  <figure class="mp-card">
    <div ref="box" class="mp-fit">
      <div :style="{ width: `${OUTER_W * scale}px`, height: `${OUTER_H * scale}px`, position: 'relative' }">
        <div class="phone" :style="{ width: `${OUTER_W}px`, height: `${OUTER_H}px`, transform: `scale(${scale})` }">
          <div class="statusbar" />
          <div class="screen">
            <slot />
          </div>
        </div>
      </div>
    </div>
    <figcaption class="mp-caption">{{ caption }}</figcaption>
    <div v-if="$slots.toolbar" class="mp-toolbar">
      <slot name="toolbar" />
    </div>
  </figure>
</template>

<script setup lang="ts">
/**
 * Gabarit de téléphone des maquettes : 360 DP de large, comme un Android courant, avec
 * la barre de statut de l'app. Le téléphone est dessiné à sa taille réelle puis mis à
 * l'échelle pour remplir la hauteur disponible de la carte — les DP du mobile restent
 * des px dans le code, seule la présentation change. Le texte est en VT323, la police de
 * l'app (chargée par la page /graphiste).
 */
defineProps<{ caption: string }>();

const BORDER = 8;
const OUTER_W = 360 + 2 * BORDER;
const OUTER_H = 740 + 2 * BORDER;

const box = ref<HTMLDivElement>();
const scale = ref(1);
let observer: ResizeObserver | null = null;

function fit() {
  if (!box.value) return;
  const w = box.value.clientWidth;
  const h = box.value.clientHeight;
  if (!w || !h) return;
  scale.value = Math.max(0.3, Math.min(w / OUTER_W, h / OUTER_H, 1.5));
}

onMounted(() => {
  fit();
  observer = new ResizeObserver(fit);
  if (box.value) observer.observe(box.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.mp-card {
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
}
.mp-fit {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.phone {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
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
.mp-caption {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
.mp-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
