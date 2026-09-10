<template>
  <div class="st" :class="{ compact }">
    <MockIconButton :src="minus" glyph="−" :size="26" :box="44" title="Diminuer" />
    <div class="st-content"><slot /></div>
    <MockIconButton :src="plus" glyph="+" :size="26" :box="44" title="Augmenter" />
  </div>
</template>

<script setup lang="ts">
/** Portage de `Stepper` : `−` [ contenu ] `+`. Glyphes texte tant que les icônes ne sont pas déposées. */
withDefaults(defineProps<{ minus: string | null; plus: string | null; compact?: boolean }>(), { compact: false });
</script>

<style scoped>
.st {
  display: flex;
  align-items: center;
  width: 100%;
}
.compact {
  width: auto;
}
.st-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.compact .st-content {
  flex: none;
  min-width: 28px;
}
</style>
