<template>
  <UModal v-model:open="open" title="Confirmation">
    <template #body>
      <p class="text-sm">{{ message }}</p>
    </template>
    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <UButton variant="solid" color="neutral" @click="close">Annuler</UButton>
        <UButton color="error" @click="onConfirm">Confirmer</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  message: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const open = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    if (!val) emit("cancel");
  },
});

function onConfirm() {
  emit("confirm");
}
</script>
