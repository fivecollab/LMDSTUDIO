import 'server-only';
import { supabase } from './supabase';
import { versMedia } from './contenu';
import type { Media } from './types';

export async function listerMedias(): Promise<Media[]> {
  const { data, error } = await supabase().from('medias').select('*').order('cree_le', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(versMedia);
}

export interface ProjetAdmin {
  id: number;
  slug: string;
  titre: string;
  categorie: string;
  publie: boolean;
  couvertureId: number | null;
  titreDetail: string;
  client: string;
  annee: string;
  services: string;
  description: string;
  galerie: ({ type: 'paire'; medias: [number, number] } | { type: 'large'; media: number })[];
}

export async function listerProjets(): Promise<(ProjetAdmin & { couverture: Media | null })[]> {
  const { data, error } = await supabase().from('projets').select('*, couverture:medias(*)').order('ordre');
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    titre: p.titre,
    categorie: p.categorie,
    publie: p.publie,
    couvertureId: p.couverture_id,
    titreDetail: p.titre_detail,
    client: p.client,
    annee: p.annee,
    services: p.services,
    description: p.description,
    galerie: p.galerie,
    couverture: p.couverture ? versMedia(p.couverture) : null,
  }));
}
