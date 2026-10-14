'use client';

import { useState } from 'react';
import { supprimerMedia } from '@/app/admin/actions';
import type { Media } from '@/lib/types';
import Envoi from './Envoi';
import Vignette from './Vignette';

export default function Bibliotheque({ medias: initiaux }: { medias: Media[] }) {
  const [medias, setMedias] = useState(initiaux);
  const [message, setMessage] = useState('');

  async function supprimer(m: Media) {
    if (!confirm(`Supprimer « ${m.nom} » ? Il sera retiré du collage et des projets qui l’utilisent.`)) return;
    const r = await supprimerMedia(m.id!);
    if (r?.erreur) setMessage(r.erreur);
    else setMedias((l) => l.filter((x) => x.id !== m.id));
  }

  return (
    <>
      <Envoi onEnvoye={(m) => setMedias((l) => [m, ...l])} />
      {message && <p className="message message--erreur">{message}</p>}
      <ul className="grille-medias">
        {medias.map((m) => (
          <li key={m.id}>
            <Vignette media={m} />
            <span className="grille-medias-nom" title={m.nom}>
              {m.nom}
            </span>
            <span className="grille-medias-dim">
              {m.largeur} × {m.hauteur} px · {m.t === 'video' ? 'vidéo' : 'image'}
            </span>
            <button type="button" className="btn btn--danger btn--petit" onClick={() => supprimer(m)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      {!medias.length && <p className="vide">Aucun média pour l’instant.</p>}
    </>
  );
}
