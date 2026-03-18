<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Utilisateurs" icon="i-lucide-users">
        <template #right>
          <UButton v-if="can('users.manage')" icon="i-lucide-plus" @click="openCreateModal">Nouvel utilisateur</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-3/4" />
      </div>
      <div v-else-if="error" class="text-error p-4">{{ error }}</div>

      <div v-else class="p-4">
        <UTable :data="userList" :columns="tableColumns" class="w-full" />

        <div v-if="userList.length === 0" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-lucide-inbox" class="text-4xl text-muted mb-2" />
          <p class="text-muted">Aucun utilisateur</p>
        </div>
      </div>

      <!-- Create/Edit User Modal -->
      <UModal v-model:open="showUserModal">
        <template #content>
          <div class="p-6">
            <h2 class="text-lg font-bold mb-4">{{ editingUser ? 'Modifier' : 'Nouvel' }} utilisateur</h2>
            <form class="space-y-4" @submit.prevent="saveUser">
              <UFormField label="Nom">
                <UInput v-model="form.name" required />
              </UFormField>
              <UFormField label="Email">
                <UInput v-model="form.email" type="email" required />
              </UFormField>
              <UFormField :label="editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'">
                <UInput v-model="form.password" type="password" :required="!editingUser" />
              </UFormField>
              <div v-if="!editingUser">
                <p class="text-muted mb-2">Permissions</p>
                <div class="space-y-1">
                  <label v-for="p in ASSIGNABLE_PERMS" :key="p" class="flex items-center gap-2">
                    <input v-model="form.permissions" type="checkbox" :value="p" />
                    <span>{{ permLabel(p) }}</span>
                  </label>
                </div>
              </div>
              <div v-if="formError" class="text-error">{{ formError }}</div>
              <div class="flex gap-2 justify-end">
                <UButton variant="soft" color="neutral" @click="showUserModal = false">Annuler</UButton>
                <UButton type="submit" :loading="formLoading">{{ editingUser ? 'Enregistrer' : 'Créer' }}</UButton>
              </div>
            </form>
          </div>
        </template>
      </UModal>

      <!-- Permissions Modal -->
      <UModal v-model:open="showPermsModal">
        <template #content>
          <div class="p-6">
            <h2 class="text-lg font-bold mb-4">Permissions — {{ permsTarget?.name }}</h2>
            <div class="space-y-2">
              <label v-for="p in ASSIGNABLE_PERMS" :key="p" class="flex items-center gap-2">
                <input v-model="permsForm" type="checkbox" :value="p" />
                <span>{{ permLabel(p) }}</span>
              </label>
            </div>
            <div v-if="permsError" class="text-error mt-2">{{ permsError }}</div>
            <div class="flex gap-2 justify-end mt-4">
              <UButton variant="soft" color="neutral" @click="showPermsModal = false">Annuler</UButton>
              <UButton :loading="permsLoading" @click="savePerms">Enregistrer</UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- Delete Confirm -->
      <ConfirmDialog
        :visible="!!userToDelete"
        :message="`Supprimer l'utilisateur « ${userToDelete?.name} » ?`"
        @confirm="confirmDelete"
        @cancel="userToDelete = null"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { h } from "vue";

const { can, user: currentUser } = useAuth();
const { listUsers, createUser, updateUser, updateUserPermissions, deleteUser, suspendUser, communityBanUser } = useApi();

const ASSIGNABLE_PERMS = ["*", "pois.view", "pois.manage", "users.view", "users.manage"];

function permLabel(p: string): string {
  const labels: Record<string, string> = {
    "*": "Super Admin",
    "pois.view": "POIs (lecture)",
    "pois.manage": "POIs (gestion)",
    "users.view": "Utilisateurs (lecture)",
    "users.manage": "Utilisateurs (gestion)",
  };
  return labels[p] ?? p;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  permissions: string[];
  suspended?: boolean;
  communityBanned?: boolean;
}

const userList = ref<UserRow[]>([]);
const loading = ref(true);
const error = ref("");

// Create/Edit modal
const showUserModal = ref(false);
const editingUser = ref<UserRow | null>(null);
const form = reactive({ name: "", email: "", password: "", permissions: [] as string[] });
const formLoading = ref(false);
const formError = ref("");

// Permissions modal
const showPermsModal = ref(false);
const permsTarget = ref<UserRow | null>(null);
const permsForm = ref<string[]>([]);
const permsLoading = ref(false);
const permsError = ref("");

// Delete
const userToDelete = ref<UserRow | null>(null);

const tableColumns = computed(() => {
  const cols: any[] = [
    { accessorKey: "name", header: "Nom" },
    { accessorKey: "email", header: "Email" },
    {
      id: "permissions",
      header: "Permissions",
      cell: ({ row }: any) => {
        const u = row.original as UserRow;
        if (u.permissions.length === 0) return h("span", { class: "text-dimmed" }, "Aucune");
        return h("div", { class: "flex flex-wrap gap-1" }, u.permissions.map((p: string) =>
          h(resolveComponent("UBadge"), { variant: "subtle", color: p === "*" ? "warning" : "neutral", key: p }, () => permLabel(p))
        ));
      },
    },
  ];

  if (can("users.manage")) {
    cols.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const u = row.original as UserRow;
        const buttons = [
          h(resolveComponent("UButton"), { size: "sm", onClick: () => openEditModal(u) }, () => "Modifier"),
          h(resolveComponent("UButton"), { size: "sm", variant: "soft", onClick: () => openPermsModal(u) }, () => "Permissions"),
        ];
        if (u.id !== currentUser.value?.id) {
          buttons.push(
            h(resolveComponent("UButton"), {
              size: "sm",
              variant: "outline",
              color: "neutral",
              onClick: () => toggleSuspend(u),
            }, () => u.suspended ? "Réactiver" : "Suspendre"),
            h(resolveComponent("UButton"), {
              size: "sm",
              variant: "outline",
              color: "neutral",
              onClick: () => toggleCommunityBan(u),
            }, () => u.communityBanned ? "Débannir communauté" : "Ban communauté"),
            h(resolveComponent("UButton"), {
              size: "sm",
              color: "error",
              variant: "soft",
              onClick: () => onDeleteRequest(u),
            }, () => "Supprimer"),
          );
        }
        return h("div", { class: "flex flex-wrap gap-1" }, buttons);
      },
    });
  }

  return cols;
});

async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    userList.value = await listUsers();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editingUser.value = null;
  form.name = "";
  form.email = "";
  form.password = "";
  form.permissions = [];
  formError.value = "";
  showUserModal.value = true;
}

function openEditModal(u: UserRow) {
  editingUser.value = u;
  form.name = u.name;
  form.email = u.email;
  form.password = "";
  form.permissions = [...u.permissions];
  formError.value = "";
  showUserModal.value = true;
}

async function saveUser() {
  formLoading.value = true;
  formError.value = "";
  try {
    if (editingUser.value) {
      const data: Record<string, string> = {};
      if (form.name !== editingUser.value.name) data.name = form.name;
      if (form.email !== editingUser.value.email) data.email = form.email;
      if (form.password) data.password = form.password;
      const updated = await updateUser(editingUser.value.id, data);
      const idx = userList.value.findIndex((u) => u.id === editingUser.value!.id);
      if (idx >= 0) userList.value[idx] = updated;
    } else {
      if (!form.password) {
        formError.value = "Le mot de passe est requis";
        return;
      }
      if (form.password.length < 8) {
        formError.value = "Le mot de passe doit contenir au moins 8 caracteres";
        return;
      }
      const created = await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        permissions: form.permissions,
      });
      userList.value.push(created);
    }
    showUserModal.value = false;
  } catch (e: any) {
    formError.value = e.message;
  } finally {
    formLoading.value = false;
  }
}

function openPermsModal(u: UserRow) {
  permsTarget.value = u;
  permsForm.value = [...u.permissions];
  permsError.value = "";
  showPermsModal.value = true;
}

async function savePerms() {
  if (!permsTarget.value) return;
  permsLoading.value = true;
  permsError.value = "";
  try {
    const result = await updateUserPermissions(permsTarget.value.id, permsForm.value);
    const target = permsTarget.value;
    if (!target) return;
    const idx = userList.value.findIndex((u) => u.id === target.id);
    if (idx >= 0) userList.value[idx]!.permissions = result.permissions;
    showPermsModal.value = false;
  } catch (e: any) {
    permsError.value = e.message;
  } finally {
    permsLoading.value = false;
  }
}

function onDeleteRequest(u: UserRow) {
  userToDelete.value = u;
}

async function confirmDelete() {
  if (!userToDelete.value) return;
  try {
    await deleteUser(userToDelete.value.id);
    userList.value = userList.value.filter((u) => u.id !== userToDelete.value!.id);
  } catch (e: any) {
    error.value = e.message;
  }
  userToDelete.value = null;
}

async function toggleSuspend(u: UserRow) {
  const next = !u.suspended;
  const reason = next ? prompt("Raison de la suspension (optionnel) :") ?? undefined : undefined;
  try {
    await suspendUser(u.id, next, reason);
    u.suspended = next;
  } catch (e: any) {
    error.value = e.message;
  }
}

async function toggleCommunityBan(u: UserRow) {
  try {
    await communityBanUser(u.id, !u.communityBanned);
    u.communityBanned = !u.communityBanned;
  } catch (e: any) {
    error.value = e.message;
  }
}

onMounted(fetchUsers);
</script>
