interface AuthUser {
  id: number;
  email: string;
  name: string;
}

const IMPLIES: Record<string, string[]> = {
  "*": ["pois.view", "pois.manage", "users.view", "users.manage"],
  "pois.manage": ["pois.view"],
  "users.manage": ["users.view"],
};

/**
 * Session handling for the admin panel.
 *
 * The JWT is no longer held by this app. It used to be written to `localStorage`, where
 * any script running on the page could read and exfiltrate a token valid for seven days.
 * It now lives in an httpOnly cookie set by the API at login: the browser attaches it
 * automatically (`credentials: "include"`) and no JavaScript — ours or injected — can read
 * it. "Being logged in" is therefore derived from `/api/auth/me` answering, not from a
 * token we can inspect.
 *
 * CSRF is covered by the cookie's `SameSite=lax`: admin.wandaris.com and api.wandaris.com
 * share a registrable domain, so our own calls count as same-site and carry the cookie,
 * while a request issued by any third-party page does not.
 */
export function useAuth() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const user = useState<AuthUser | null>("auth-user", () => null);
  const permissions = useState<string[]>("auth-permissions", () => []);

  const isAuthenticated = computed(() => !!user.value);

  function can(perm: string): boolean {
    const perms = permissions.value;
    if (perms.includes(perm)) return true;
    for (const p of perms) {
      const implied = IMPLIES[p];
      if (implied && implied.includes(perm)) return true;
    }
    return false;
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      credentials: "include", // receive the httpOnly session cookie
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    // `data.token` is deliberately ignored here — it exists for the mobile client.
    user.value = data.user;
    permissions.value = data.permissions ?? [];
  }

  async function fetchMe(): Promise<boolean> {
    try {
      const res = await fetch(`${apiBase}/api/auth/me`, { credentials: "include" });
      if (!res.ok) {
        clearAuth();
        return false;
      }
      const data = await res.json();
      user.value = data.user;
      permissions.value = data.permissions ?? [];
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }

  async function logout() {
    // Clearing local state matters more than the round-trip succeeding.
    await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    clearAuth();
    navigateTo("/login");
  }

  function clearAuth() {
    user.value = null;
    permissions.value = [];
  }

  return { user, permissions, isAuthenticated, login, fetchMe, logout, can };
}
