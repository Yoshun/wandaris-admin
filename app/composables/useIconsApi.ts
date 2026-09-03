import type { IconItem, IconsResponse } from "~~/types/poi";

/**
 * Accès au dépôt d'icônes (page /graphiste).
 *
 * Volontairement séparé de `useApi` : cette page vit hors du panel, avec son propre
 * cookie `wandaris_icons` ouvert par mot de passe. Un 401 ne doit pas renvoyer vers
 * /login (ce que fait `useApi`) mais réafficher le formulaire de mot de passe — d'où
 * l'état partagé `icons-locked` que la page observe.
 */
export function useIconsApi() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase as string;
  const locked = useState<boolean>("icons-locked", () => false);

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${apiBase}${path}`, { credentials: "include", ...init });
    if (res.status === 401) {
      locked.value = true;
      throw new Error("Mot de passe requis");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Erreur ${res.status}`);
    }
    return res.json();
  }

  async function login(password: string): Promise<void> {
    await call<{ ok: boolean }>("/api/icons/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    locked.value = false;
  }

  async function logout(): Promise<void> {
    await fetch(`${apiBase}/api/icons/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    locked.value = true;
  }

  function list(): Promise<IconsResponse> {
    return call<IconsResponse>("/api/icons");
  }

  function upload(category: string, slug: string, file: File): Promise<IconItem & { warnings: string[] }> {
    const form = new FormData();
    form.append("file", file);
    // Pas de Content-Type : le navigateur pose lui-même la frontière multipart
    return call(`/api/icons/${category}/${slug}`, { method: "POST", body: form });
  }

  function integrate(category: string, slug: string): Promise<IconItem> {
    return call<IconItem>(`/api/icons/${category}/${slug}/integrate`, { method: "POST" });
  }

  return { apiBase, locked, login, logout, list, upload, integrate };
}
