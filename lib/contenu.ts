import 'server-only';
import { unstable_cache } from 'next/cache';
import { supabase, supabaseActif } from './supabase';
import type { BlocGalerie, Carte, Collage, Format, Media, Projet, Reglages } from './types';

// Tag de cache invalidé par l'admin à chaque enregistrement.
export const TAG_CONTENU = 'contenu';

const REGLAGES_DEFAUT: Reglages = { instagram: '', email: 'john@lmdstudios.ch' };

// ---------- Sans Supabase : aucun contenu (tout vient de la base, via l'admin) ----------

const COLLAGE_VIDE: Collage = { desktop: [], tablette: [], mobile: [] };

// ---------- Lecture Supabase ----------

interface LigneMedia {
  id: number;
  type: 'img' | 'video';
  url: string;
  poster: string | null;
  largeur: number;
  hauteur: number;
  nom: string;
}

export function versMedia(l: LigneMedia): Media {
  return { id: l.id, t: l.type, src: l.url, poster: l.poster, largeur: l.largeur, hauteur: l.hauteur, nom: l.nom };
}

async function lireReglages(): Promise<Reglages> {
  const { data, error } = await supabase().from('reglages').select('cle, valeur');
  if (error) throw error;
  const r = { ...REGLAGES_DEFAUT };
  for (const { cle, valeur } of (data ?? []) as { cle: string; valeur: string }[]) {
    if (cle === 'instagram' || cle === 'email') r[cle] = valeur;
  }
  return r;
}

async function lireCollage(): Promise<Collage> {
  const { data, error } = await supabase()
    .from('collage')
    .select('id, format, x, y, w, h, a, media:medias(*)')
    .order('ordre');
  if (error) throw error;
  const c: Collage = { desktop: [], tablette: [], mobile: [] };
  for (const l of (data ?? []) as unknown as (Omit<Carte, 'media'> & { format: Format; media: LigneMedia })[]) {
    if (!l.media) continue;
    c[l.format].push({ id: l.id, media: versMedia(l.media), x: l.x, y: l.y, w: l.w, h: l.h, a: l.a });
  }
  return c;
}

interface LigneProjet {
  id: number;
  slug: string;
  titre: string;
  categorie: string;
  publie: boolean;
  titre_detail: string;
  client: string;
  annee: string;
  services: string;
  description: string;
  galerie: ({ type: 'paire'; medias: [number, number] } | { type: 'large'; media: number })[];
  couverture: LigneMedia | null;
}

async function lireProjets(): Promise<Projet[]> {
  const { data, error } = await supabase()
    .from('projets')
    .select('*, couverture:medias(*)')
    .order('ordre');
  if (error) throw error;
  const lignes = (data ?? []) as unknown as LigneProjet[];

  // Médias de toutes les galeries, en une requête.
  const ids = new Set<number>();
  for (const p of lignes) for (const b of p.galerie) (b.type === 'paire' ? b.medias : [b.media]).forEach((i) => ids.add(i));
  const medias = new Map<number, Media>();
  if (ids.size) {
    const { data: ms, error: e2 } = await supabase().from('medias').select('*').in('id', [...ids]);
    if (e2) throw e2;
    for (const m of (ms ?? []) as LigneMedia[]) medias.set(m.id, versMedia(m));
  }

  return lignes.map((p) => ({
    id: p.id,
    slug: p.slug,
    titre: p.titre,
    categorie: p.categorie,
    couverture: p.couverture ? versMedia(p.couverture) : null,
    publie: p.publie,
    titreDetail: p.titre_detail || p.titre,
    client: p.client,
    annee: p.annee,
    services: p.services.split('\n').map((s) => s.trim()).filter(Boolean),
    description: p.description.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
    galerie: p.galerie
      .map((b): BlocGalerie | null => {
        if (b.type === 'large') {
          const m = medias.get(b.media);
          return m ? { type: 'large', media: m } : null;
        }
        const [a, c] = b.medias.map((i) => medias.get(i));
        return a && c ? { type: 'paire', medias: [a, c] } : null;
      })
      .filter((b): b is BlocGalerie => b !== null),
  }));
}

/** Images de la traînée du curseur, dans l'ordre enregistré (réglage « curseur » = liste d'id). */
async function lireCurseur(): Promise<Media[]> {
  const { data: r, error } = await supabase().from('reglages').select('valeur').eq('cle', 'curseur').maybeSingle();
  if (error) throw error;
  let ids: number[] = [];
  try {
    ids = JSON.parse(r?.valeur || '[]');
  } catch {
    return [];
  }
  if (!ids.length) return [];
  const { data, error: e2 } = await supabase().from('medias').select('*').in('id', ids);
  if (e2) throw e2;
  const parId = new Map((data as LigneMedia[]).map((m) => [m.id, versMedia(m)]));
  return ids.map((i) => parId.get(i)).filter((m): m is Media => Boolean(m));
}

// ---------- API publique (mise en cache, invalidée par l'admin) ----------

// Invalidé à chaque enregistrement dans l'admin ; relu au plus tard après 60 s
// (au cas où la base est modifiée directement dans Supabase).
const enCache = <T,>(fn: () => Promise<T>, cle: string) =>
  unstable_cache(fn, [cle], { tags: [TAG_CONTENU], revalidate: 60 });

export async function getReglages(): Promise<Reglages> {
  if (!supabaseActif()) return REGLAGES_DEFAUT;
  return enCache(lireReglages, 'reglages')();
}

export async function getCollage(): Promise<Collage> {
  if (!supabaseActif()) return COLLAGE_VIDE;
  return enCache(lireCollage, 'collage')();
}

export async function getCurseur(): Promise<Media[]> {
  if (!supabaseActif()) return [];
  return enCache(lireCurseur, 'curseur')();
}

/** Projets publiés, dans l'ordre choisi dans l'admin. */
export async function getProjets(): Promise<Projet[]> {
  if (!supabaseActif()) return [];
  const tous = await enCache(lireProjets, 'projets')();
  return tous.filter((p) => p.publie && p.couverture);
}

// Lecture sans cache, pour l'admin.
export const admin = { lireReglages, lireCollage, lireProjets, lireCurseur };
