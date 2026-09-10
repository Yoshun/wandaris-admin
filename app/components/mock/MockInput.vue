<template>
  <div class="in" :class="{ multi }">
    <span :class="value ? 'val' : 'ph'">{{ value || placeholder }}</span>
  </div>
</template>

<script setup lang="ts">
/** Portage de `PixelInput` : champ carré, biseau inversé (creux), police VT323. */
withDefaults(defineProps<{ placeholder: string; value?: string; multi?: boolean }>(), { value: "", multi: false });
</script>

<style scoped>
.in {
  width: 100%;
  padding: 8px 10px;
  background: var(--input-bg);
  border: 2px solid;
  border-color: var(--frame-bevel-dark) var(--frame-bevel-light) var(--frame-bevel-light) var(--frame-bevel-dark);
  font-size: 18px;
  display: flex;
  align-items: flex-start;
}
.multi {
  min-height: 64px;
}
.ph { color: var(--placeholder-text); }
.val { color: var(--input-text); }
</style>
