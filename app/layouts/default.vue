<template>
  <div class="min-h-screen">
    <header class="border-b border-default px-6 py-3">
      <div class="w-full flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary">
          RandoQuest Admin
        </NuxtLink>
        <nav class="flex items-center gap-2">
          <UButton
            to="/"
            variant="solid"
            :color="route.path === '/' ? 'primary' : 'neutral'"
          >
            Dashboard
          </UButton>
          <UButton
            to="/import"
            variant="solid"
            :color="route.path === '/import' ? 'primary' : 'neutral'"
          >
            Import
          </UButton>
          <UColorModeButton />
        </nav>
      </div>
    </header>
    <main class="w-full px-6 py-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>
