'use client';

import { useState } from 'react';
import { enregistrerProjet, supprimerProjet, type DonneesProjet } from '@/app/admin/actions';
import type { ProjetAdmin } from '@/lib/admin-donnees';
import type { Media } from '@/lib/types';
import { versSlug } from '@/lib/slug';
import ChoixMedia from './ChoixMedia';
import Vignette from './Vignette';

type Bloc = DonneesProjet['galerie'][number];
// Cible du sélecteur de média : couverture, ou un emplacement de la galerie.
type Cible = { type: 'couverture' } | { type: 'galerie'; bloc: number; place: number } | { type: 'nouveau'; bloc: Bloc['type'] };


export default function FormProjet({ projet, medias: mediasInitiaux }: { projet: ProjetAdmin; medias: Media[] }) {
  // Adresse enregistrée (peut recevoir un suffixe -2, -3… si le titre est déjà utilisé).
  const [slug, setSlug] = useState(projet.slug);
  const [d, setD] = useState<DonneesProjet>({
    titre: projet.titre,
    categorie: projet.categorie,
    couvertureId: projet.couvertureId,
    publie: projet.publie,
    titreDetail: projet.titreDetail,
    client: projet.client,
    annee: projet.annee,
    services: projet.services,
    description: projet.description,
    galerie: projet.galerie,
  });
  const [medias, setMedias] = useState(mediasInitiaux);
  const [cible, setCible] = useState<Cible | null>(null);
  const [message, setMessage] = useState<{ ok?: string; erreur?: string }>({});
  const [envoi, setEnvoi] = useState(false);

  const parId = (id: number | null) => medias.find((m) => m.id === id) ?? null;
  const champ = (k: keyof DonneesProjet) => ({
    value: d[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value }),
  });

  function choisir(m: Media) {
    if (!cible) return;
    if (cible.type === 'couverture') setD({ ...d, couvertureId: m.id! });
    else if (cible.type === 'nouveau')
      setD({
        ...d,
        galerie: [...d.galerie, cible.bloc === 'large' ? { type: 'large', media: m.id! } : { type: 'paire', medias: [m.id!, m.id!] }],
      });
    else
      setD({
        ...d,
        galerie: d.galerie.map((b, i) => {
          if (i !== cible.bloc) return b;
          if (b.type === 'large') return { ...b, media: m.id! };
          const ms: [number, number] = [...b.medias];
          ms[cible.place] = m.id!;
          return { ...b, medias: ms };
        }),
      });
    setCible(null);
  }

  function deplacerBloc(i: number, sens: -1 | 1) {
    const g = [...d.galerie];
    const j = i + sens;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    setD({ ...d, galerie: g });
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    const r = await enregistrerProjet(projet.id, d);
    if (r?.slug) setSlug(r.slug);
    setMessage(r ?? {});
    setEnvoi(false);
  }

  const emplacement = (m: Media | null, onClick: () => void, format: string) => (
    <button type="button" className={`emplacement emplacement--${format}`} onClick={onClick}>
      {m ? <Vignette media={m} /> : <span>Choisir un média</span>}
    </button>
  );

  return (
    <form className="formulaire formulaire--projet" onSubmit={enregistrer}>
      <section className="carte-admin">
        <h2>Carte du projet (page Work)</h2>
        <div className="colonnes">
          <div>
            <p className="label">Couverture (4:5)</p>
            {emplacement(parId(d.couvertureId), () => setCible({ type: 'couverture' }), 'portrait')}
          </div>
          <div className="champs-pile">
            <label>
              Titre
              <input {...champ('titre')} required />
            </label>
            <label>
              Catégorie
              <input {...champ('categorie')} placeholder="Motion design" />
            </label>
            <div className="adresse-auto">
              <span className="label">Adresse de la page</span>
              <span className="adresse-auto-valeur">/work/{versSlug(d.titre) || 'projet'}</span>
              <small>Créée automatiquement à partir du titre, à l’enregistrement.</small>
            </div>
            <label className="case">
              <input type="checkbox" checked={d.publie} onChange={(e) => setD({ ...d, publie: e.target.checked })} />
              Publié (visible sur le site)
            </label>
          </div>
        </div>
      </section>

      <section className="carte-admin">
        <h2>Page du projet</h2>
        <label>
          Titre de la page <small>(laisser vide pour reprendre le titre)</small>
          <input {...champ('titreDetail')} placeholder={d.titre} />
        </label>
        <div className="colonnes colonnes--egales">
          <label>
            Client
            <input {...champ('client')} />
          </label>
          <label>
            Année
            <input {...champ('annee')} />
          </label>
        </div>
        <label>
          Services <small>(un par ligne)</small>
          <textarea {...champ('services')} rows={3} />
        </label>
        <label>
          Description <small>(une ligne vide entre deux paragraphes)</small>
          <textarea {...champ('description')} rows={8} />
        </label>
      </section>

      <section className="carte-admin">
        <h2>Galerie</h2>
        <p className="aide">
          Paire : deux visuels côte à côte (660 × 824 sur desktop). Pleine largeur : un visuel 1344 × 588. Les
          visuels sont recadrés pour remplir l’emplacement.
        </p>
        {d.galerie.map((b, i) => (
          <div key={i} className="bloc-galerie">
            <div className="bloc-galerie-medias">
              {b.type === 'paire'
                ? b.medias.map((id, j) =>
                    <div key={j}>{emplacement(parId(id), () => setCible({ type: 'galerie', bloc: i, place: j }), 'portrait')}</div>
                  )
                : emplacement(parId(b.media), () => setCible({ type: 'galerie', bloc: i, place: 0 }), 'paysage')}
            </div>
            <div className="bloc-galerie-actions">
              <button type="button" className="btn btn--petit" onClick={() => deplacerBloc(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button type="button" className="btn btn--petit" onClick={() => deplacerBloc(i, 1)} disabled={i === d.galerie.length - 1}>
                ↓
              </button>
              <button
                type="button"
                className="btn btn--petit btn--danger"
                onClick={() => setD({ ...d, galerie: d.galerie.filter((_, j) => j !== i) })}
              >
                Retirer
              </button>
            </div>
          </div>
        ))}
        <div className="boutons-ligne">
          <button type="button" className="btn" onClick={() => setCible({ type: 'nouveau', bloc: 'paire' })}>
            + Paire
          </button>
          <button type="button" className="btn" onClick={() => setCible({ type: 'nouveau', bloc: 'large' })}>
            + Pleine largeur
          </button>
        </div>
      </section>

      <div className="barre-enregistrer">
        {message.erreur && <p className="message message--erreur">{message.erreur}</p>}
        {message.ok && <p className="message message--ok">{message.ok}</p>}
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => confirm(`Supprimer définitivement « ${d.titre} » ?`) && supprimerProjet(projet.id)}
        >
          Supprimer le projet
        </button>
        {d.publie && (
          <a className="btn" href={`/work/${slug}`} target="_blank" rel="noopener noreferrer">
            Voir la page ↗
          </a>
        )}
        <button className="btn btn--principal" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {cible && (
        <ChoixMedia
          medias={medias}
          onAjout={(m) => setMedias((l) => [m, ...l])}
          onChoix={choisir}
          onFermer={() => setCible(null)}
        />
      )}
    </form>
  );
}
