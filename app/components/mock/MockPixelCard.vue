<template>
  <div class="pc" :class="{ hi: highlighted }">
    <slot />
  </div>
</template>

<script setup lang="ts">
/** Portage de `PixelCard` : plaque d'une entrée de liste, fond plein + filet plus sombre. */
withDefaults(defineProps<{ highlighted?: boolean }>(), { highlighted: false });
</script>

<style scoped>
.pc {
  width: 100%;
  background: #46341f;
  border: 2px solid #1e140c;
  padding: 10px;
  margin-bottom: 6px;
}
.hi {
  border-color: #c4a882;
}
</style>
