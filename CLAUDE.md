# RandoQuest Admin

Panel d'administration web pour le jeu RandoQuest. Gestion des POI et import depuis OpenStreetMap.

## Stack technique

- **Framework** : Nuxt 4.3 (structure `app/`)
- **UI** : Nuxt UI 4.5 (composants UButton, UInput, USelect, UBadge, UModal, UColorModeButton)
- **CSS** : Tailwind CSS (via Nuxt UI), tokens sémantiques (`text-primary`, `text-muted`, `bg-elevated`, `border-default`)
- **Carte** : Leaflet (import direct, pas de vue-leaflet)
- **Tuiles** : MapTiler topo-v2 / topo-v2-dark (switch auto selon color mode)
- **Langage** : TypeScript
- **Backend** : API Fastify sur `localhost:4000` (repo `randoquest`)

## Structure

```
app/
  app.vue               — wrapper UApp + NuxtLayout + NuxtPage
  assets/css/main.css   — @import tailwindcss + @nuxt/ui
  layouts/
    default.vue         — header nav (Dashboard, Import) + UColorModeButton
  pages/
    index.vue           — dashboard: carte + liste/formulaire inline
    import.vue          — import Overpass: carte zones + staging approve/reject
  components/
    PoiMap.vue          — carte Leaflet avec markers POI, click interactions
    PoiList.vue         — table filtrable (recherche, type, difficulté)
    PoiForm.vue         — formulaire create/edit + Google Maps link parser
    ConfirmDialog.vue   — modal de confirmation (UModal)
    ImportMap.vue        — carte Leaflet avec zones d'import + preview
  composables/
    useApi.ts           — fetch wrapper pour toutes les routes API
  utils/
    i18n.ts             — labels français pour types/difficultés + parseGoogleMapsUrl
types/
  poi.ts                — PoiType, PoiDefinition, StagedPoi, ImportZone, etc.
nuxt.config.ts          — modules, css, apiBase runtime config
```

## Conventions Nuxt UI

- **Ne jamais** mettre `value: ""` dans les items d'un USelect (interdit par Nuxt UI). Utiliser `placeholder` pour le texte par défaut.
- **Toujours** wrapper l'app dans `<UApp>` (dans `app.vue`).
- **CSS requis** : `app/assets/css/main.css` avec `@import "tailwindcss"` et `@import "@nuxt/ui"`, référencé dans `nuxt.config.ts` via `css: [...]`.
- **Thème** : utiliser les tokens sémantiques Nuxt UI (`text-primary`, `text-muted`, `text-dimmed`, `text-error`, `text-success`, `bg-elevated`, `bg-default`, `border-default`) au lieu de classes hardcodées (`text-gray-400`, `bg-gray-900`).
- **Boutons** : `variant="solid"` par défaut.
- **Color mode** : géré par `@nuxtjs/color-mode` (auto-installé par Nuxt UI). Composant `UColorModeButton` pour le toggle. Composable `useColorMode()` pour la logique.

## Pièges connus

- **Auto-import collision** : ne pas nommer de variables `options` dans les composables — le scanner Nuxt le confond avec un export interne de Nuxt UI (`useResizable.js`). Utiliser `fetchOptions` ou autre.
- **Content-Type sur POST sans body** : Fastify refuse un header `Content-Type: application/json` si le body est vide. Le header ne doit être envoyé que quand `fetchOptions.body` existe.
- **Types POI** : le fichier `types/poi.ts` est une copie indépendante (pas de package partagé). Synchroniser manuellement avec `shared/src/poi.ts` du repo principal si les types changent.

## API Backend

Base URL configurée dans `nuxt.config.ts` → `runtimeConfig.public.apiBase` (défaut `http://localhost:4000`).

Le composable `useApi()` expose toutes les fonctions typées :
- POI : `listPois`, `getPoi`, `createPoi`, `updatePoi`, `deletePoi`
- Import : `importOverpass`, `listStaging`, `updateStaging`, `approveStaged`, `rejectStaged`, `approveAllStaged`, `listImportZones`

## Types de POI

22 types avec labels français (voir `app/utils/i18n.ts`) :
castle, church, ruin, manor, archaeological_site, tower, city_gate, summit, viewpoint, waterfall, cave, hot_spring, volcano, glacier, lake, bridge, garden, square, mill, lighthouse, geological, monument
