import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Entete from '@/components/Entete';
import { PiedDePage } from '@/components/Actions';
import CarteProjet from '@/components/CarteProjet';
import { getProjets, getReglages } from '@/lib/contenu';

// Régénérée à chaque enregistrement dans l'admin, et au plus tard toutes les 60 s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Work — LMD Studios',
};

export default async function WorkPage() {
  const [reglages, projets] = await Promise.all([getReglages(), getProjets()]);
  // Pas de projet publié : la page n'existe pas (et le lien Work est masqué partout).
  if (!projets.length) notFound();

  return (
    <div className="cadre travaux">
      <main className="page">
        <Entete
          nav={[
            { label: 'Back', href: '/' },
            { label: 'About', href: '/about' },
          ]}
        />

        <h1 className="titre-page">All works</h1>
        <div className="grille-projets">
          {projets.map((p) => (
            <CarteProjet key={p.slug} projet={p} />
          ))}
        </div>

        <PiedDePage reglages={reglages} />
      </main>
    </div>
  );
}
