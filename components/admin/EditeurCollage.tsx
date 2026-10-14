'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { enregistrerCollage } from '@/app/admin/actions';
import { BASES, FORMATS, type Collage, type Format, type Media } from '@/lib/types';
import ChoixMedia from './ChoixMedia';
import Vignette from './Vignette';

interface CarteEd {
  cle: string;
  media: Media;
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
}

const NOMS: Record<Format, string> = { desktop: 'Desktop', tablette: 'Tablette', mobile: 'Mobile' };

// Fond et zones occupées par l'interface, pour placer les cartes comme sur le site.
const FONDS: Record<Format, string> = {
  desktop: "#242424 url('/assets/fond-desktop.png') center / cover no-repeat",
  tablette: "#242424 url('/assets/fond-tablette.png') center top / 100% auto no-repeat",
  mobile: "#242424 url('/assets/fond-mobile.png') center top / 100% auto no-repeat",
};
const ZONES: Record<Format, { y: number; h: number; label: string }[]> = {
  desktop: [
    { y: 0, h: 70, label: 'En-tête' },
    { y: 790, h: 90, label: 'Consigne et boutons' },
  ],
  tablette: [{ y: 0, h: 330, label: 'En-tête, boutons et consigne' }],
  mobile: [{ y: 0, h: 330, label: 'En-tête, boutons et consigne' }],
};
// Largeur d'une nouvelle carte, dans le repère du format.
const LARGEUR_NOUVELLE: Record<Format, number> = { desktop: 250, tablette: 230, mobile: 120 };

let compteur = 0;
const nouvelleCle = () => `c${++compteur}`;
const arrondi = (v: number) => Math.round(v * 10) / 10;

type Geste =
  | { type: 'deplacer'; cle: string; px: number; py: number; x: number; y: number }
  | { type: 'taille'; cle: string; px: number; py: number; c: CarteEd }
  | { type: 'rotation'; cle: string; cx: number; cy: number };

export default function EditeurCollage({ collage, medias: mediasInitiaux }: { collage: Collage; medias: Media[] }) {
  const [cartes, setCartes] = useState<Record<Format, CarteEd[]>>(() => {
    const r = {} as Record<Format, CarteEd[]>;
    for (const f of FORMATS) r[f] = collage[f].map((c) => ({ cle: nouvelleCle(), ...c }));
    return r;
  });
  const [format, setFormat] = useState<Format>('desktop');
  const [sel, setSel] = useState<string | null>(null);
  const [modifie, setModifie] = useState<Record<Format, boolean>>({ desktop: false, tablette: false, mobile: false });
  const [verrou, setVerrou] = useState(true);
  const [choix, setChoix] = useState<null | 'ajout' | 'remplacer'>(null);
  const [medias, setMedias] = useState(mediasInitiaux);
  const [message, setMessage] = useState<{ ok?: string; erreur?: string }>({});
  const [envoi, setEnvoi] = useState(false);

  const base = BASES[format];
  const liste = cartes[format];
  const carteSel = liste.find((c) => c.cle === sel) ?? null;

  // Échelle d'affichage : le repère du format tient dans la largeur disponible.
  const zone = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.5);
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.min(1, el.clientWidth / base.w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [base.w]);

  const modifier = useCallback(
    (f: (l: CarteEd[]) => CarteEd[]) => {
      setCartes((c) => ({ ...c, [format]: f(c[format]) }));
      setModifie((m) => ({ ...m, [format]: true }));
      setMessage({});
    },
    [format]
  );
  const maj = useCallback(
    (cle: string, patch: Partial<CarteEd>) => modifier((l) => l.map((c) => (c.cle === cle ? { ...c, ...patch } : c))),
    [modifier]
  );

  // ---------- Gestes à la souris ----------
  const geste = useRef<Geste | null>(null);
  useEffect(() => {
    function bouger(e: PointerEvent) {
      const g = geste.current;
      if (!g) return;
      if (g.type === 'deplacer') {
        maj(g.cle, { x: arrondi(g.x + (e.clientX - g.px) / s), y: arrondi(g.y + (e.clientY - g.py) / s) });
      } else if (g.type === 'taille') {
        const { c } = g;
        const r = (c.a * Math.PI) / 180;
        const dx = (e.clientX - g.px) / s;
        const dy = (e.clientY - g.py) / s;
        // Déplacement exprimé dans le repère de la carte pivotée ; la carte grandit autour de son centre.
        const lx = dx * Math.cos(r) + dy * Math.sin(r);
        const ly = -dx * Math.sin(r) + dy * Math.cos(r);
        const w = Math.max(10, c.w + 2 * lx);
        const h = verrou ? (w * c.h) / c.w : Math.max(10, c.h + 2 * ly);
        maj(g.cle, {
          w: arrondi(w),
          h: arrondi(h),
          x: arrondi(c.x + c.w / 2 - w / 2),
          y: arrondi(c.y + c.h / 2 - h / 2),
        });
      } else {
        let a = (Math.atan2(e.clientY - g.cy, e.clientX - g.cx) * 180) / Math.PI + 90;
        if (a > 180) a -= 360;
        if (e.shiftKey) a = Math.round(a / 15) * 15;
        maj(g.cle, { a: arrondi(a) });
      }
    }
    function fin() {
      geste.current = null;
    }
    window.addEventListener('pointermove', bouger);
    window.addEventListener('pointerup', fin);
    return () => {
      window.removeEventListener('pointermove', bouger);
      window.removeEventListener('pointerup', fin);
    };
  }, [maj, s, verrou]);

  // Flèches : déplacer de 1 px (10 px avec Maj). Suppr : retirer la carte.
  useEffect(() => {
    function touche(e: KeyboardEvent) {
      if (!carteSel) return;
      const cible = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName)) return;
      const pas = e.shiftKey ? 10 : 1;
      const d: Record<string, [number, number]> = {
        ArrowLeft: [-pas, 0],
        ArrowRight: [pas, 0],
        ArrowUp: [0, -pas],
        ArrowDown: [0, pas],
      };
      if (d[e.key]) {
        e.preventDefault();
        maj(carteSel.cle, { x: arrondi(carteSel.x + d[e.key][0]), y: arrondi(carteSel.y + d[e.key][1]) });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        supprimer(carteSel.cle);
      }
    }
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  });

  // Prévenir avant de quitter avec des modifications non enregistrées.
  const nonEnregistre = FORMATS.some((f) => modifie[f]);
  useEffect(() => {
    if (!nonEnregistre) return;
    const avant = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avant);
    return () => window.removeEventListener('beforeunload', avant);
  }, [nonEnregistre]);

  // ---------- Actions ----------
  function supprimer(cle: string) {
    modifier((l) => l.filter((c) => c.cle !== cle));
    setSel(null);
  }
  function deplacerDansPile(cle: string, vers: 'haut' | 'bas' | 'devant' | 'derriere') {
    modifier((l) => {
      const i = l.findIndex((c) => c.cle === cle);
      const n = [...l];
      const [c] = n.splice(i, 1);
      const j = { haut: Math.min(l.length - 1, i + 1), bas: Math.max(0, i - 1), devant: l.length - 1, derriere: 0 }[vers];
      n.splice(j, 0, c);
      return n;
    });
  }
  function proportionsOrigine(c: CarteEd) {
    if (!c.media.largeur || !c.media.hauteur) return;
    const h = (c.w * c.media.hauteur) / c.media.largeur;
    maj(c.cle, { h: arrondi(h), y: arrondi(c.y + c.h / 2 - h / 2) });
  }
  function choisir(m: Media) {
    if (choix === 'remplacer' && carteSel) {
      const h = m.largeur && m.hauteur ? (carteSel.w * m.hauteur) / m.largeur : carteSel.h;
      maj(carteSel.cle, { media: m, h: arrondi(h), y: arrondi(carteSel.y + carteSel.h / 2 - h / 2) });
    } else {
      const w = LARGEUR_NOUVELLE[format];
      const h = m.largeur && m.hauteur ? (w * m.hauteur) / m.largeur : w;
      const c: CarteEd = {
        cle: nouvelleCle(),
        media: m,
        w,
        h: arrondi(h),
        x: arrondi(base.w / 2 - w / 2),
        y: arrondi(format === 'desktop' ? base.h / 2 - h / 2 : 600),
        a: 0,
      };
      modifier((l) => [...l, c]);
      setSel(c.cle);
    }
    setChoix(null);
  }
  function copierDepuis(source: Format) {
    if (source === format) return;
    if (cartes[format].length && !confirm(`Remplacer les ${cartes[format].length} cartes ${NOMS[format]} par une copie de ${NOMS[source]} ?`)) return;
    const k = BASES[format].w / BASES[source].w;
    modifier(() =>
      cartes[source].map((c) => ({
        ...c,
        cle: nouvelleCle(),
        x: arrondi(c.x * k),
        y: arrondi(c.y * k),
        w: arrondi(c.w * k),
        h: arrondi(c.h * k),
      }))
    );
    setSel(null);
  }
  async function enregistrer() {
    setEnvoi(true);
    setMessage({});
    try {
      for (const f of FORMATS.filter((x) => modifie[x])) {
        const r = await enregistrerCollage(
          f,
          cartes[f].map((c) => ({ mediaId: c.media.id!, x: c.x, y: c.y, w: c.w, h: c.h, a: c.a }))
        );
        if (r?.erreur) throw new Error(`${NOMS[f]} : ${r.erreur}`);
        setModifie((m) => ({ ...m, [f]: false }));
      }
      setMessage({ ok: 'Collage enregistré. Le site est à jour.' });
    } catch (e) {
      setMessage({ erreur: (e as Error).message });
    }
    setEnvoi(false);
  }

  const champ = (nom: keyof Pick<CarteEd, 'x' | 'y' | 'w' | 'h' | 'a'>, label: string, unite = 'px') =>
    carteSel && (
      <label className="champ-num">
        {label}
        <span>
          <input
            type="number"
            step="any"
            value={carteSel[nom]}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isNaN(v)) return;
              if ((nom === 'w' || nom === 'h') && verrou) {
                const k = v / carteSel[nom];
                if (!Number.isFinite(k) || v <= 0) return;
                const w = nom === 'w' ? v : carteSel.w * k;
                const h = nom === 'h' ? v : carteSel.h * k;
                maj(carteSel.cle, { w: arrondi(w), h: arrondi(h) });
              } else {
                maj(carteSel.cle, { [nom]: v });
              }
            }}
          />
          {unite}
        </span>
      </label>
    );

  return (
    <div className="editeur">
      <div className="editeur-barre">
        <div className="onglets">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              className={`onglet ${f === format ? 'onglet--actif' : ''}`}
              onClick={() => {
                setFormat(f);
                setSel(null);
              }}
            >
              {NOMS[f]} <small>({cartes[f].length})</small>
              {modifie[f] && <span className="pastille" title="Modifications non enregistrées" />}
            </button>
          ))}
        </div>
        <button type="button" className="btn" onClick={() => setChoix('ajout')}>
          + Ajouter une image
        </button>
        <select
          className="btn"
          value=""
          onChange={(e) => copierDepuis(e.target.value as Format)}
          aria-label="Copier la disposition depuis un autre format"
        >
          <option value="">Copier depuis…</option>
          {FORMATS.filter((f) => f !== format).map((f) => (
            <option key={f} value={f}>
              {NOMS[f]}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn--principal" disabled={!nonEnregistre || envoi} onClick={enregistrer}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {message.erreur && <p className="message message--erreur">{message.erreur}</p>}
      {message.ok && <p className="message message--ok">{message.ok}</p>}

      <div className="editeur-corps">
        <div className="editeur-scene" ref={zone}>
          <p className="aide">
            Glisser une image : la déplacer · carré en bas à droite : la taille · rond au-dessus : la rotation (Maj :
            par 15°) · flèches du clavier : au pixel près. Les zones en pointillé sont occupées par le texte et les
            boutons du site. Écran {NOMS[format].toLowerCase()} : {base.w} × {base.h} px.
          </p>
          <div
            className="scene"
            style={{ width: base.w * s, height: base.h * s, background: FONDS[format] }}
            onPointerDown={(e) => e.target === e.currentTarget && setSel(null)}
          >
            {liste.map((c, i) => (
              <div
                key={c.cle}
                className={`scene-carte ${c.cle === sel ? 'scene-carte--sel' : ''}`}
                style={{
                  left: c.x * s,
                  top: c.y * s,
                  width: c.w * s,
                  height: c.h * s,
                  transform: `rotate(${c.a}deg)`,
                  zIndex: i + 1,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSel(c.cle);
                  geste.current = { type: 'deplacer', cle: c.cle, px: e.clientX, py: e.clientY, x: c.x, y: c.y };
                }}
              >
                <div className="scene-carte-media" style={{ borderRadius: 12 * s }}>
                  <Vignette media={c.media} />
                </div>
                {c.cle === sel && (
                  <>
                    <span
                      className="poignee poignee--taille"
                      title="Redimensionner"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        geste.current = { type: 'taille', cle: c.cle, px: e.clientX, py: e.clientY, c };
                      }}
                    />
                    <span
                      className="poignee poignee--rotation"
                      title="Pivoter"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                        geste.current = { type: 'rotation', cle: c.cle, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
                      }}
                    />
                  </>
                )}
              </div>
            ))}
            {ZONES[format].map((z) => (
              <div key={z.label} className="scene-zone" style={{ top: z.y * s, height: z.h * s }}>
                {z.label}
              </div>
            ))}
          </div>
        </div>

        <aside className="editeur-panneau">
          {carteSel ? (
            <>
              <Vignette media={carteSel.media} className="vignette vignette--grande" />
              <p className="panneau-nom" title={carteSel.media.nom}>
                {carteSel.media.nom}
                <br />
                <small>
                  Original : {carteSel.media.largeur} × {carteSel.media.hauteur} px
                </small>
              </p>
              <div className="champs">
                {champ('x', 'X')}
                {champ('y', 'Y')}
                {champ('w', 'Largeur')}
                {champ('h', 'Hauteur')}
                {champ('a', 'Rotation', '°')}
              </div>
              <label className="case">
                <input type="checkbox" checked={verrou} onChange={(e) => setVerrou(e.target.checked)} />
                Garder les proportions
              </label>
              <button type="button" className="btn" onClick={() => proportionsOrigine(carteSel)}>
                Proportions d’origine
              </button>
              <div className="boutons-pile">
                <button type="button" className="btn" onClick={() => deplacerDansPile(carteSel.cle, 'devant')}>
                  Premier plan
                </button>
                <button type="button" className="btn" onClick={() => deplacerDansPile(carteSel.cle, 'haut')}>
                  Avancer
                </button>
                <button type="button" className="btn" onClick={() => deplacerDansPile(carteSel.cle, 'bas')}>
                  Reculer
                </button>
                <button type="button" className="btn" onClick={() => deplacerDansPile(carteSel.cle, 'derriere')}>
                  Arrière-plan
                </button>
              </div>
              <button type="button" className="btn" onClick={() => setChoix('remplacer')}>
                Remplacer l’image
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const c = { ...carteSel, cle: nouvelleCle(), x: carteSel.x + 20, y: carteSel.y + 20 };
                  modifier((l) => [...l, c]);
                  setSel(c.cle);
                }}
              >
                Dupliquer
              </button>
              <button type="button" className="btn btn--danger" onClick={() => supprimer(carteSel.cle)}>
                Retirer du collage
              </button>
            </>
          ) : (
            <p className="aide">
              {liste.length
                ? 'Clique sur une image pour régler sa position, sa taille et sa rotation.'
                : 'Cet écran est vide : clique sur « + Ajouter une image » pour commencer.'}
            </p>
          )}
        </aside>
      </div>

      {choix && (
        <ChoixMedia
          medias={medias}
          onAjout={(m) => setMedias((l) => [m, ...l])}
          onChoix={choisir}
          onFermer={() => setChoix(null)}
        />
      )}
    </div>
  );
}
