<template>
  <div class="st" :class="{ compact }">
    <MockIconButton :src="minus" :size="24" :box="32" title="−" />
    <div class="st-content"><slot /></div>
    <MockIconButton :src="plus" :size="24" :box="32" title="+" />
  </div>
</template>

<script setup lang="ts">
/** Portage de `Stepper` : `−` [ contenu ] `+`, avec les glyphes générés du dépôt. */
withDefaults(defineProps<{ minus: string | null; plus: string | null; compact?: boolean }>(), { compact: false });
</script>

<style scoped>
.st {
  display: flex;
  align-items: center;
  gap: 8px;
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
  min-width: 40px;
}
</style>
