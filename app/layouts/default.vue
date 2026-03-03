<template>
  <div class="min-h-screen">
    <header class="border-b border-default px-6 py-3">
      <div class="w-full flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-primary">
          Wandaris Admin
        </NuxtLink>
        <nav class="flex items-center gap-2">
          <UButton
            v-if="can('pois.view')"
            to="/"
            variant="solid"
            :color="route.path === '/' ? 'primary' : 'neutral'"
          >
            Dashboard
          </UButton>
          <UButton
            v-if="can('pois.manage')"
            to="/import"
            variant="solid"
            :color="route.path === '/import' ? 'primary' : 'neutral'"
          >
            Import
          </UButton>
          <UButton
            v-if="can('users.view')"
            to="/users"
            variant="solid"
            :color="route.path === '/users' ? 'primary' : 'neutral'"
          >
            Utilisateurs
          </UButton>
          <UColorModeButton />
          <span v-if="user" class="text-muted text-sm ml-2">{{ user.name }}</span>
          <UButton
            v-if="user"
            variant="soft"
            color="neutral"
            size="sm"
            @click="logout"
          >
            Déconnexion
          </UButton>
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
const { user, logout, can } = useAuth();
</script>
