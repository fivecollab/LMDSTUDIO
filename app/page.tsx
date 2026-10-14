import type { Metadata } from 'next';
import Collage from '@/components/Collage';
import Entete from '@/components/Entete';
import Actions from '@/components/Actions';
import TraineeCurseur from '@/components/TraineeCurseur';
import { getCollage, getCurseur, getProjets, getReglages } from '@/lib/contenu';
import { FORMATS } from '@/lib/types';

// Régénérée à chaque enregistrement dans l'admin, et au plus tard toutes les 60 s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'John Leon Morales — LMD Studios',
};

export default async function HomePage() {
  const [reglages, collage, projets, curseur] = await Promise.all([
    getReglages(),
    getCollage(),
    getProjets(),
    getCurseur(),
  ]);

  return (
    <div
      className="cadre accueil"
      // Formats sans image : la consigne « Drag around… » est masquée (voir globals.css).
      data-vide-desktop={collage.desktop.length ? undefined : ''}
      data-vide-tablette={collage.tablette.length ? undefined : ''}
      data-vide-mobile={collage.mobile.length ? undefined : ''}
    >
      <main className="page">
        <Collage collage={collage} />
        <TraineeCurseur images={curseur} formatsAvecCollage={FORMATS.filter((f) => collage[f].length)} />
        <div className="zone-haut">
          <Entete
            nav={[
              ...(projets.length ? [{ label: 'Work', href: '/work' }] : []),
              { label: 'About', href: '/about' },
            ]}
          />
          {/* Tablette / mobile : boutons et consigne sous l'en-tête */}
          <div className="accueil-actions">
            <Actions reglages={reglages} className="actions--pile" />
            <p className="consigne">*Drag around the work to explore the archive.</p>
          </div>
        </div>

        {/* Desktop : consigne et boutons en bas de la carte */}
        <footer className="accueil-pied">
          <p className="consigne">*Drag around the work to explore the archive.</p>
          <Actions reglages={reglages} />
        </footer>
      </main>
    </div>
  );
}
