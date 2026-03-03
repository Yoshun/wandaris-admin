const ROUTE_PERMISSIONS: Record<string, string> = {
  "/users": "users.view",
  "/import": "pois.manage",
};

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;

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
