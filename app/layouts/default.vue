<template>
  <UDashboardGroup>
    <UDashboardSidebar
      id="admin"
      collapsible
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex items-center gap-2 px-1 py-1">
          <span class="text-primary font-bold text-lg">W</span>
          <span v-if="!collapsed" class="text-primary font-bold text-lg truncate">Wandaris</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navItems"
          orientation="vertical"
          tooltip
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex items-center gap-2 px-2 py-2">
          <UColorModeButton />
          <template v-if="!collapsed && user">
            <span class="text-muted text-sm truncate flex-1">{{ user.name }}</span>
            <UButton
              icon="i-lucide-log-out"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="logout"
            />
          </template>
        </div>
      </template>
    </UDashboardSidebar>

    <div class="flex-1 min-w-0 h-screen overflow-y-auto">
      <div class="p-6 h-full">
        <slot />
      </div>
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, logout, can } = useAuth()

const navItems = computed(() => {
  const items: any[] = []

  if (can('pois.view')) {
    items.push({
      label: 'Dashboard',
      icon: 'i-lucide-map',
      to: '/',
      active: route.path === '/'
    })
  }
  if (can('pois.manage')) {
    items.push({
      label: 'Import',
      icon: 'i-lucide-download',
      to: '/import',
      active: route.path === '/import'
    })
  }
  if (can('pois.manage')) {
    items.push({
      label: 'Types',
      icon: 'i-lucide-tags',
      to: '/types',
      active: route.path === '/types'
    })
  }
  if (can('users.view')) {
    items.push({
      label: 'Utilisateurs',
      icon: 'i-lucide-users',
      to: '/users',
      active: route.path === '/users'
    })
  }
  if (can('pois.view')) {
    items.push({
      label: 'Logs',
      icon: 'i-lucide-scroll-text',
      to: '/logs',
      active: route.path === '/logs'
    })
  }

  return items
})
</script>
