const ROUTE_PERMISSIONS: Record<string, string> = {
  "/users": "users.view",
  "/import": "pois.manage",
  "/monsters": "pois.manage",
  "/biomes": "pois.manage",
  "/crafting": "pois.manage",
  "/settings": "pois.manage",
  "/types": "pois.manage",
  "/logs": "pois.manage",
};

export default defineNuxtRouteMiddleware(async (to) => {
  // /graphiste a sa propre porte (mot de passe, cookie dedie) : hors session du panel
  if (to.path === "/login" || to.path === "/graphiste") return;

  const { isAuthenticated, fetchMe, can } = useAuth();

  if (!isAuthenticated.value) {
    const valid = await fetchMe();
    if (!valid) {
      return navigateTo("/login");
    }
  }

  const requiredPerm = ROUTE_PERMISSIONS[to.path];
  if (requiredPerm && !can(requiredPerm)) {
    return navigateTo("/");
  }
});
