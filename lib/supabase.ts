import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const BUCKET = 'medias';

let client: SupabaseClient | null = null;

/** Supabase est-il configuré (variables d'environnement présentes) ? */
export function supabaseActif() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Client serveur (clé service_role) : ne jamais l'importer côté navigateur. */
export function supabase() {
  if (!supabaseActif()) throw new Error('Supabase non configuré (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}
