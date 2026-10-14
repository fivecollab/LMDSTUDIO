import Link from 'next/link';
import { listerProjets } from '@/lib/admin-donnees';
import { creerProjet, deplacerProjet } from '../../actions';
import Vignette from '@/components/admin/Vignette';
import EntetePage from '@/components/admin/EntetePage';

export default async function ProjetsPage() {
  const projets = await listerProjets();
  const publies = projets.filter((p) => p.publie && p.couvertureId).length;

  return (
    <>
      <EntetePage
        titre="Projets"
        actions={
          <form action={creerProjet}>
            <button className="btn btn--principal">+ Nouveau projet</button>
          </form>
        }
      >
        La page Work, dans cet ordre (flèches pour changer l’ordre). Un clic sur un projet du site ouvre sa page
        détail.{' '}
        {publies
          ? `${publies} projet(s) publié(s) : le lien « Work » est visible.`
          : 'Aucun projet publié : le lien « Work » est masqué sur le site.'}
      </EntetePage>
      <ul className="liste-projets">
        {projets.map((p, i) => (
          <li key={p.id}>
            {p.couverture ? <Vignette media={p.couverture} /> : <span className="vignette vignette-vide">—</span>}
            <div>
              <strong>{p.titre}</strong>
              <small>
                {p.categorie || 'Sans catégorie'} · /work/{p.slug}
              </small>
            </div>
            <span className={`statut-projet ${p.publie ? 'statut-projet--publie' : ''}`}>
              {p.publie ? 'Publié' : 'Brouillon'}
            </span>
            <form action={deplacerProjet.bind(null, p.id, -1)}>
              <button className="btn btn--petit" disabled={i === 0} title="Monter">
                ↑
              </button>
            </form>
            <form action={deplacerProjet.bind(null, p.id, 1)}>
              <button className="btn btn--petit" disabled={i === projets.length - 1} title="Descendre">
                ↓
              </button>
            </form>
            <Link className="btn btn--petit" href={`/admin/projets/${p.id}`}>
              Modifier
            </Link>
          </li>
        ))}
      </ul>
      {!projets.length && (
        <p className="vide">Aucun projet pour l’instant. Clique sur « + Nouveau projet » pour créer le premier.</p>
      )}
    </>
  );
}
