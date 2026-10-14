'use client';

import { useRef, useState } from 'react';
import { envoyerFichier } from './televersement';
import type { Media } from '@/lib/types';

// Zone d'envoi : glisser-déposer ou sélection de fichiers (images et vidéos).
export default function Envoi({ onEnvoye }: { onEnvoye: (m: Media) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [encours, setEncours] = useState<{ nom: string; p: number }[]>([]);
  const [erreur, setErreur] = useState('');
  const [survol, setSurvol] = useState(false);

  async function envoyer(fichiers: FileList | null) {
    if (!fichiers?.length) return;
    setErreur('');
    const liste = [...fichiers];
    setEncours(liste.map((f) => ({ nom: f.name, p: 0 })));
    for (const [i, f] of liste.entries()) {
      try {
        const m = await envoyerFichier(f, (p) =>
          setEncours((e) => e.map((x, j) => (j === i ? { ...x, p } : x)))
        );
        onEnvoye(m);
      } catch (e) {
        setErreur((e as Error).message);
      }
      setEncours((e) => e.map((x, j) => (j === i ? { ...x, p: 1 } : x)));
    }
    setEncours([]);
    if (input.current) input.current.value = '';
  }

  return (
    <div
      className={`envoi ${survol ? 'envoi--survol' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setSurvol(true);
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSurvol(false);
        envoyer(e.dataTransfer.files);
      }}
    >
      <p>
        Glisse des images ou des vidéos ici, ou{' '}
        <button type="button" className="btn btn--lien" onClick={() => input.current?.click()}>
          choisis des fichiers
        </button>
        .
      </p>
      <small>JPG, PNG, GIF, WebP, MP4, WebM. Les dimensions d’origine sont enregistrées automatiquement.</small>
      <input ref={input} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => envoyer(e.target.files)} />
      {encours.map((e) => (
        <div key={e.nom} className="progression">
          <span>{e.nom}</span>
          <progress value={e.p} max={1} />
        </div>
      ))}
      {erreur && <p className="message message--erreur">{erreur}</p>}
    </div>
  );
}
