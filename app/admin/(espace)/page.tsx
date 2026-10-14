import Link from 'next/link';
import { admin } from '@/lib/contenu';
import { listerMedias, listerProjets } from '@/lib/admin-donnees';
import EntetePage from '@/components/admin/EntetePage';

// Tableau de bord : ce qui est visible sur le site en ce moment, et l'accès à chaque rubrique.
export default async function TableauDeBord() {
  const [collage, curseur, projets, medias, reglages] = await Promise.all([
    admin.lireCollage(),
    admin.lireCurseur(),
    listerProjets(),
    listerMedias(),
    admin.lireReglages(),
  ]);
  const publies = projets.filter((p) => p.publie && p.couvertureId).length;
  const brouillons = projets.length - publies;
  const cartes = collage.desktop.length + collage.tablette.length + collage.mobile.length;

  const RUBRIQUES = [
    {
      href: '/admin/collage',
      titre: 'Collage',
      lieu: 'Page d’accueil',
      etat: cartes
        ? `${collage.desktop.length} desktop · ${collage.tablette.length} tablette · ${collage.mobile.length} mobile`
        : 'Vide',
      actif: cartes > 0,
      texte: 'Les images déplaçables de l’accueil. Tu choisis leur place, leur taille et leur rotation pour chaque écran.',
    },
    {
      href: '/admin/curseur',
      titre: 'Curseur',
      lieu: 'Page d’accueil',
      etat: curseur.length ? `${curseur.length} image(s)` : 'Aucune image',
      actif: curseur.length > 0,
      texte: 'Les images qui suivent la souris quand le collage est vide.',
    },
    {
      href: '/admin/projets',
      titre: 'Projets',
      lieu: 'Page Work',
      etat: projets.length ? `${publies} publié(s) · ${brouillons} brouillon(s)` : 'Aucun projet',
      actif: publies > 0,
      texte: publies
        ? 'Le lien « Work » est visible dans le menu du site.'
        : 'Le lien « Work » apparaîtra dès qu’un projet sera publié.',
    },
    {
      href: '/admin/medias',
      titre: 'Médias',
      lieu: 'Bibliothèque',
      etat: `${medias.length} fichier(s)`,
      actif: medias.length > 0,
      texte: 'Toutes tes images et vidéos. Envoie-les ici, puis utilise-les dans le collage, le curseur ou les projets.',
    },
    {
      href: '/admin/reglages',
      titre: 'Réglages',
      lieu: 'Tout le site',
      etat: reglages.instagram ? 'Instagram affiché' : 'Instagram masqué',
      actif: Boolean(reglages.instagram),
      texte: `Lien Instagram et email du bouton « Let’s talk about your project » (${reglages.email}).`,
    },
  ];

  return (
    <>
      <EntetePage
        titre="Tableau de bord"
        actions={
          <a className="btn btn--principal" href="/" target="_blank" rel="noopener noreferrer">
            Voir le site ↗
          </a>
        }
      >
        Ce qui est en ligne en ce moment. Choisis une rubrique pour la modifier : chaque enregistrement met le site à
        jour immédiatement.
      </EntetePage>
      <ul className="tableau">
        {RUBRIQUES.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="tuile">
              <span className="tuile-lieu">{r.lieu}</span>
              <span className="tuile-titre">{r.titre}</span>
              <span className={`tuile-etat ${r.actif ? 'tuile-etat--actif' : ''}`}>{r.etat}</span>
              <span className="tuile-texte">{r.texte}</span>
              <span className="tuile-lien">Modifier →</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
