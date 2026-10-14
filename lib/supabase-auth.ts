import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';

// Authentification de l'admin par Supabase Auth (email + mot de passe du compte créé dans Supabase).
// Tout se passe côté serveur (middleware, pages, actions) : aucune clé n'est envoyée au navigateur.
// La clé « anon » est préférable ; à défaut, la clé service_role (serveur uniquement) fait l'affaire.
export function cleAuth() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function authActive() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && cleAuth());
}

export function clientAuth(cookies: CookieMethodsServer) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cleAuth(), {
    cookies,
    auth: { autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Client lié aux cookies de la requête en cours (pages et actions serveur). */
export async function clientAuthServeur() {
  const { cookies } = await import('next/headers');
  const jar = await cookies();
  return clientAuth({
    getAll: () => jar.getAll(),
    setAll: (liste) => {
      try {
        for (const { name, value, options } of liste) jar.set(name, value, options);
      } catch {
        // Appelé depuis une page (lecture seule) : le middleware rafraîchit déjà la session.
      }
    },
  });
}

/**
 * Seuls les comptes dont app_metadata.role vaut « admin » ont accès à l'admin.
 * app_metadata n'est modifiable qu'avec la clé service_role : un compte créé par
 * inscription publique n'a donc jamais ce rôle.
 */
export function estAdmin(user: { app_metadata?: Record<string, unknown> } | null) {
  return user?.app_metadata?.role === 'admin';
}

/** Utilisateur connecté et admin (vérifié auprès de Supabase), ou null. */
export async function utilisateurAdmin() {
  if (!authActive()) return null;
  const { data } = await (await clientAuthServeur()).auth.getUser();
  return estAdmin(data.user) ? data.user : null;
}
