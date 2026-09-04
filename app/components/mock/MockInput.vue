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
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid;
  border-color: #0d0906 #7d6448 #7d6448 #0d0906;
  font-size: 18px;
  display: flex;
  align-items: flex-start;
}
.multi {
  min-height: 64px;
}
.ph { color: #888888; }
.val { color: #f0e6d2; }
</style>
