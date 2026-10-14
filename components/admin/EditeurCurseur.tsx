'use client';

import { useState } from 'react';
import { enregistrerCurseur } from '@/app/admin/actions';
import type { Media } from '@/lib/types';
import ChoixMedia from './ChoixMedia';
import Vignette from './Vignette';

export default function EditeurCurseur({ images: initiales, medias: mediasInitiaux }: { images: Media[]; medias: Media[] }) {
  const [images, setImages] = useState(initiales);
  const [medias, setMedias] = useState(mediasInitiaux);
  const [choix, setChoix] = useState(false);
  const [modifie, setModifie] = useState(false);
  const [message, setMessage] = useState<{ ok?: string; erreur?: string }>({});
  const [envoi, setEnvoi] = useState(false);

  const changer = (l: Media[]) => {
    setImages(l);
    setModifie(true);
    setMessage({});
  };
  const deplacer = (i: number, sens: -1 | 1) => {
    const j = i + sens;
    if (j < 0 || j >= images.length) return;
    const l = [...images];
    [l[i], l[j]] = [l[j], l[i]];
    changer(l);
  };

  async function enregistrer() {
    setEnvoi(true);
    const r = await enregistrerCurseur(images.map((m) => m.id!));
    setMessage(r ?? {});
    if (!r?.erreur) setModifie(false);
    setEnvoi(false);
  }

  return (
    <>
      <div className="editeur-barre">
        <span className="aide" style={{ margin: '0 auto 0 0' }}>
          {images.length ? `${images.length} image(s)` : 'Aucune image : pas d’effet au survol.'}
        </span>
        <button type="button" className="btn" onClick={() => setChoix(true)}>
          + Ajouter une image
        </button>
        <button type="button" className="btn btn--principal" disabled={!modifie || envoi} onClick={enregistrer}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {message.erreur && <p className="message message--erreur">{message.erreur}</p>}
      {message.ok && <p className="message message--ok">{message.ok}</p>}

      <ol className="grille-medias grille-curseur">
        {images.map((m, i) => (
          <li key={`${m.id}-${i}`}>
            <Vignette media={m} className="vignette vignette--proportions" />
            <span className="grille-medias-dim">
              {i + 1}. {m.largeur} × {m.hauteur} px
            </span>
            <div className="boutons-ligne">
              <button type="button" className="btn btn--petit" onClick={() => deplacer(i, -1)} disabled={i === 0}>
                ←
              </button>
              <button type="button" className="btn btn--petit" onClick={() => deplacer(i, 1)} disabled={i === images.length - 1}>
                →
              </button>
              <button
                type="button"
                className="btn btn--petit btn--danger"
                onClick={() => changer(images.filter((_, j) => j !== i))}
              >
                Retirer
              </button>
            </div>
          </li>
        ))}
      </ol>

      {choix && (
        <ChoixMedia
          medias={medias.filter((m) => m.t === 'img')}
          onAjout={(m) => setMedias((l) => [m, ...l])}
          onChoix={(m) => {
            changer([...images, m]);
            setChoix(false);
          }}
          onFermer={() => setChoix(false)}
        />
      )}
    </>
  );
}
