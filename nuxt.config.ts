export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  ssr: false,
runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000",
      maptilerKey: process.env.NUXT_PUBLIC_MAPTILER_KEY || "",
    },
  },
});
