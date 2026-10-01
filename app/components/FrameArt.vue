<template>
  <!-- Remplit son parent (position: relative attendue) ; aucun événement : le contenu reste cliquable. -->
  <div class="fa" aria-hidden="true">
    <div v-if="fill" class="fa-fill" :style="fillStyle" />
    <div v-for="e in edges" :key="e.slot" class="fa-piece" :style="e.style" />
    <img
      v-for="c in corners"
      :key="c.slot"
      :src="c.url"
      alt=""
      class="fa-piece fa-corner"
      :style="c.style"
    />
  </div>
</template>

<script setup lang="ts">
import type { FramePieces, FrameSlot } from "~/utils/frameArt";

/**
 * Le cadre assemblé à partir de ses 8 morceaux, à la taille du parent. Voir `utils/frameArt.ts`
 * pour la règle. `scale` = pixels CSS par pixel de l'art, toujours entier : une échelle non
 * entière déformerait les pixels, ce qu'on interdit justement aux côtés. Un morceau absent
 * laisse un trou — c'est voulu dans l'aperçu de la page graphiste, qui montre l'assemblage
 * au fil des dépôts.
 */
const props = withDefaults(defineProps<{ pieces: FramePieces; scale?: number; fill?: string }>(), { scale: 1 });

const px = (n: number) => `${n * props.scale}px`;

/** Taille d'un morceau à l'écran, 0 s'il manque. */
function size(slot: FrameSlot) {
  const p = props.pieces[slot];
  return { w: p ? p.width : 0, h: p ? p.height : 0 };
}

const corners = computed(() => {
  const at: Record<string, Record<string, string>> = {
    "corner-tl": { top: "0", left: "0" },
    "corner-tr": { top: "0", right: "0" },
    "corner-bl": { bottom: "0", left: "0" },
    "corner-br": { bottom: "0", right: "0" },
  };
  return (["corner-tl", "corner-tr", "corner-bl", "corner-br"] as const)
    .filter((slot) => props.pieces[slot])
    .map((slot) => {
      const p = props.pieces[slot]!;
      return { slot, url: p.url, style: { ...at[slot], width: px(p.width), height: px(p.height) } };
    });
});

/** Côtés entre les coins, contre le bord extérieur, répétés depuis leur extrémité haute / gauche. */
const edges = computed(() => {
  const tl = size("corner-tl"), tr = size("corner-tr"), bl = size("corner-bl"), br = size("corner-br");
  const geometry: Record<string, { box: Record<string, string>; repeat: string }> = {
    "edge-top": { box: { top: "0", left: px(tl.w), right: px(tr.w), height: px(size("edge-top").h) }, repeat: "repeat-x" },
    "edge-bottom": { box: { bottom: "0", left: px(bl.w), right: px(br.w), height: px(size("edge-bottom").h) }, repeat: "repeat-x" },
    "edge-left": { box: { left: "0", top: px(tl.h), bottom: px(bl.h), width: px(size("edge-left").w) }, repeat: "repeat-y" },
    "edge-right": { box: { right: "0", top: px(tr.h), bottom: px(br.h), width: px(size("edge-right").w) }, repeat: "repeat-y" },
  };
  return (["edge-top", "edge-bottom", "edge-left", "edge-right"] as const)
    .filter((slot) => props.pieces[slot])
    .map((slot) => {
      const p = props.pieces[slot]!;
      return {
        slot,
        style: {
          ...geometry[slot]!.box,
          backgroundImage: `url("${p.url}")`,
          backgroundRepeat: geometry[slot]!.repeat,
          backgroundSize: `${px(p.width)} ${px(p.height)}`,
          backgroundPosition: "0 0",
        },
      };
    });
});

/** Le fond de la fenêtre, en dedans des côtés : ce qui est transparent dans un côté laisse voir derrière la fenêtre. */
const fillStyle = computed(() => ({
  top: px(size("edge-top").h),
  bottom: px(size("edge-bottom").h),
  left: px(size("edge-left").w),
  right: px(size("edge-right").w),
  background: props.fill,
}));
</script>

<style scoped>
.fa {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.fa-fill,
.fa-piece {
  position: absolute;
}
.fa-piece {
  image-rendering: pixelated;
}
.fa-corner {
  z-index: 1;
  max-width: none;
}
</style>
