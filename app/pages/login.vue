<template>
  <div class="min-h-screen flex items-center justify-center bg-default">
    <div class="w-full max-w-sm space-y-6 p-8 bg-elevated rounded-xl border border-default">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-primary">Wandaris Admin</h1>
        <p class="text-muted mt-1">Connexion requise</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
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

        <p v-if="error" class="text-error text-sm">{{ error }}</p>

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
