import Link from 'next/link';
import Media from './Media';
import type { Projet } from '@/lib/types';

export default function CarteProjet({ projet, legende = true }: { projet: Projet; legende?: boolean }) {
  return (
    <Link className="projet" href={`/work/${projet.slug}`}>
      <div className="projet-visuel">{projet.couverture && <Media media={projet.couverture} />}</div>
      {legende && (
        <p className="projet-legende">
          <span className="projet-titre">{projet.titre}</span>
          <span className="projet-categorie">{projet.categorie}</span>
        </p>
      )}
    </Link>
  );
}
