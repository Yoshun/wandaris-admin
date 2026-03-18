<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-950">
    <div class="w-full max-w-sm space-y-6 p-8 bg-elevated rounded-xl border border-default">
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center gap-2">
          <UIcon name="i-lucide-compass" class="text-primary text-2xl" />
          <h1 class="text-2xl font-bold text-primary">Wandaris</h1>
        </div>
        <p class="text-muted">Connexion requise</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Pseudo ou email">
          <UInput
            v-model="email"
            placeholder="admin@wandaris.com"
            autofocus
            class="w-full"
          />
        </UFormField>

        <UFormField label="Mot de passe">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <p v-if="error" class="text-error">{{ error }}</p>

        <UButton
          type="submit"
          block
          :loading="loading"
          variant="solid"
          color="primary"
        >
          Se connecter
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const { login } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    await login(email.value, password.value);
    await navigateTo("/");
  } catch (err: any) {
    error.value = err.message ?? "Erreur de connexion";
  } finally {
    loading.value = false;
  }
}
</script>
