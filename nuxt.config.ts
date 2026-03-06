export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  ssr: false,
runtimeConfig: {
    public: {
      apiBase: "http://localhost:4000",
      maptilerKey: "",
    },
  },
});
