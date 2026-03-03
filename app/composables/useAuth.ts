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

export function useAuth() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;

  const token = useState<string | null>("auth-token", () => {
    if (import.meta.client) {
      return localStorage.getItem("auth-token");
    }
    return null;
  });

  const user = useState<AuthUser | null>("auth-user", () => null);
  const permissions = useState<string[]>("auth-permissions", () => []);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    token.value = data.token;
    user.value = data.user;
    permissions.value = data.permissions ?? [];
    if (import.meta.client) {
      localStorage.setItem("auth-token", data.token);
    }
  }

  async function fetchMe(): Promise<boolean> {
    if (!token.value) return false;

    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });

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

  function logout() {
    clearAuth();
    navigateTo("/login");
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    permissions.value = [];
    if (import.meta.client) {
      localStorage.removeItem("auth-token");
    }
  }

  return { token, user, permissions, isAuthenticated, login, fetchMe, logout, can };
}
