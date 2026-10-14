import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseActif } from '@/lib/supabase';
import { utilisateurAdmin } from '@/lib/supabase-auth';
import NavAdmin from '@/components/admin/NavAdmin';
import { deconnexion } from '../actions';

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  // Seconde vérification après le middleware : jamais de page admin sans session valide.
  const utilisateur = await utilisateurAdmin();
  if (!utilisateur) redirect('/admin/login');

  return (
    <div className="admin-cadre">
      <div className="admin-page">
        <header className="admin-entete">
          <Link href="/admin" className="admin-ident">
            LMD Studios ©2026
            <br />
            <span>Espace admin</span>
          </Link>
          <NavAdmin />
          <div className="admin-entete-droite">
            <a href="/" target="_blank" rel="noopener noreferrer" className="lien-souligne">
              Voir le site ↗
            </a>
            <form action={deconnexion}>
              <button className="lien-souligne" title={utilisateur.email}>
                Déconnexion
              </button>
            </form>
          </div>
        </header>
        <main className="admin-contenu">
          {supabaseActif() ? (
            children
          ) : (
            <p className="message message--erreur">
              Supabase n’est pas configuré : ajoute <code>NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> aux variables d’environnement, puis redémarre le serveur.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
