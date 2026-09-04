<template>
  <MockPhone caption="Connexion">
    <div class="au">
      <img v-if="logo" :src="logo" alt="" class="au-logo" />
      <div v-else class="au-logo au-logo-missing">LOGO</div>
      <MockFrame :padding="28" style="width: 85%">
        <div class="au-form">
          <span class="au-title">Connexion</span>
          <div class="au-input"><span>Pseudo ou email</span></div>
          <div class="au-input"><span>••••••••</span></div>
          <MockButton label="Se connecter" full-width />
          <span class="au-link">Créer un compte</span>
        </div>
      </MockFrame>
    </div>
  </MockPhone>
</template>

<script setup lang="ts">
import type { MockIcons } from "~/utils/mockIcons";

const props = defineProps<{ icons: MockIcons }>();
const logo = computed(() => props.icons.url("identity", "logo"));
</script>

<style scoped>
.au {
  position: absolute;
  inset: 0;
  background: #1a1410;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.au-logo {
  width: 130px;
  height: 130px;
  object-fit: contain;
}
.au-logo-missing {
  border: 2px dashed #c4a882;
  color: #aaaaaa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 2px;
}
.au-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px;
}
.au-title {
  font-size: 22px;
  font-weight: bold;
  color: #c4a882;
  text-align: center;
  margin-bottom: 6px;
}
.au-input {
  height: 40px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid;
  border-color: #0d0906 #7d6448 #7d6448 #0d0906;
  color: #888888;
  font-size: 18px;
}
.au-link {
  font-size: 16px;
  color: #c4a882;
  text-align: center;
  text-decoration: underline;
  margin-top: 4px;
}
</style>
