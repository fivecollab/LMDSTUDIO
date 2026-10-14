'use client';

import type { Media } from '@/lib/types';
import Envoi from './Envoi';
import Vignette from './Vignette';

// Fenêtre de choix d'un média de la bibliothèque (avec envoi de nouveaux fichiers).
export default function ChoixMedia({
  medias,
  onAjout,
  onChoix,
  onFermer,
}: {
  medias: Media[];
  onAjout: (m: Media) => void;
  onChoix: (m: Media) => void;
  onFermer: () => void;
}) {
  return (
    <div className="modale" role="dialog" aria-modal="true" onClick={onFermer}>
      <div className="modale-contenu" onClick={(e) => e.stopPropagation()}>
        <div className="modale-entete">
          <h2>Choisir un média</h2>
          <button type="button" className="btn" onClick={onFermer}>
            Fermer
          </button>
        </div>
        <Envoi onEnvoye={onAjout} />
        <ul className="grille-medias grille-medias--choix">
          {medias.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onChoix(m)} title={m.nom}>
                <Vignette media={m} />
                <span className="grille-medias-dim">
                  {m.largeur} × {m.hauteur}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {!medias.length && <p className="vide">La bibliothèque est vide : envoie un fichier ci-dessus.</p>}
      </div>
    </div>
  );
}
