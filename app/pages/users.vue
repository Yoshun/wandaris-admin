<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-primary">Utilisateurs</h1>
      <UButton v-if="can('users.manage')" @click="openCreateModal">+ Nouvel utilisateur</UButton>
    </div>

    <div v-if="loading" class="text-muted">Chargement...</div>
    <div v-else-if="error" class="text-error">{{ error }}</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-default">
          <tr class="border-b border-default text-left text-muted">
            <th class="py-2 px-3">Nom</th>
            <th class="py-2 px-3">Email</th>
            <th class="py-2 px-3">Permissions</th>
            <th v-if="can('users.manage')" class="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in userList" :key="u.id" class="border-b border-default hover:bg-elevated">
            <td class="py-2 px-3">{{ u.name }}</td>
            <td class="py-2 px-3">{{ u.email }}</td>
            <td class="py-2 px-3">
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="p in u.permissions"
                  :key="p"
                  variant="subtle"
                  :color="p === '*' ? 'warning' : 'neutral'"
                  size="sm"
                >
                  {{ permLabel(p) }}
                </UBadge>
                <span v-if="u.permissions.length === 0" class="text-dimmed">Aucune</span>
              </div>
            </td>
            <td v-if="can('users.manage')" class="py-2 px-3">
              <div class="flex gap-1">
                <UButton size="xs" @click="openEditModal(u)">Modifier</UButton>
                <UButton size="xs" color="warning" variant="solid" @click="openPermsModal(u)">Permissions</UButton>
                <UButton
                  v-if="u.id !== currentUser?.id"
                  size="xs"
                  color="error"
                  variant="solid"
                  @click="onDeleteRequest(u)"
                >
                  Supprimer
                </UButton>
              </div>
            </td>
          </tr>
          <tr v-if="userList.length === 0">
            <td :colspan="can('users.manage') ? 4 : 3" class="py-8 text-center text-dimmed">
              Aucun utilisateur
            </td>
          </tr>
        </tbody>
      </table>
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
              <p class="text-sm text-muted mb-2">Permissions</p>
              <div class="space-y-1">
                <label v-for="p in ASSIGNABLE_PERMS" :key="p" class="flex items-center gap-2">
                  <input v-model="form.permissions" type="checkbox" :value="p" />
                  <span class="text-sm">{{ permLabel(p) }}</span>
                </label>
              </div>
            </div>
            <div v-if="formError" class="text-error text-sm">{{ formError }}</div>
            <div class="flex gap-2 justify-end">
              <UButton variant="soft" color="neutral" @click="showUserModal = false">Annuler</UButton>
              <UButton type="submit" :loading="formLoading">{{ editingUser ? 'Enregistrer' : 'Creer' }}</UButton>
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
              <span class="text-sm">{{ permLabel(p) }}</span>
            </label>
          </div>
          <div v-if="permsError" class="text-error text-sm mt-2">{{ permsError }}</div>
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
  </div>
</template>

<script setup lang="ts">
const { can, user: currentUser } = useAuth();
const { listUsers, createUser, updateUser, updateUserPermissions, deleteUser } = useApi();

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
    const idx = userList.value.findIndex((u) => u.id === permsTarget.value!.id);
    if (idx >= 0) userList.value[idx].permissions = result.permissions;
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

onMounted(fetchUsers);
</script>
