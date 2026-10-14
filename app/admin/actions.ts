'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { authActive, clientAuthServeur, estAdmin, utilisateurAdmin } from '@/lib/supabase-auth';
import { BUCKET, supabase, supabaseActif } from '@/lib/supabase';
import { TAG_CONTENU, versMedia } from '@/lib/contenu';
import { FORMATS, type Format, type Media } from '@/lib/types';
import { versSlug } from '@/lib/slug';

export type Etat = { ok?: string; erreur?: string } | undefined;

// Chaque action revérifie la session : une action serveur peut être appelée directement.
async function exigerAdmin() {
  if (!supabaseActif()) throw new Error('Supabase n’est pas configuré sur le serveur.');
  if (!(await utilisateurAdmin())) throw new Error('Non autorisé : reconnecte-toi.');
}

/** Le site public relit les contenus après chaque modification. */
function rafraichir() {
  revalidateTag(TAG_CONTENU);
  revalidatePath('/', 'layout');
}

// ---------- Session ----------

export async function connexion(_: Etat, fd: FormData): Promise<Etat> {
  if (!authActive()) return { erreur: 'Supabase n’est pas configuré sur le serveur.' };
  const auth = (await clientAuthServeur()).auth;
  const { data, error } = await auth.signInWithPassword({
    email: String(fd.get('email') ?? '').trim(),
    password: String(fd.get('motdepasse') ?? ''),
  });
  if (error) return { erreur: 'Email ou mot de passe incorrect.' };
  if (!estAdmin(data.user)) {
    await auth.signOut();
    return { erreur: 'Ce compte n’a pas les droits d’administration.' };
  }
  redirect('/admin');
}

export async function deconnexion() {
  await (await clientAuthServeur()).auth.signOut();
  redirect('/admin/login');
}

// ---------- Réglages ----------

export async function enregistrerReglages(_: Etat, fd: FormData): Promise<Etat> {
  await exigerAdmin();
  const instagram = String(fd.get('instagram') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim();
  if (instagram && !/^https:\/\/\S+$/.test(instagram)) return { erreur: 'Le lien Instagram doit commencer par https://' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { erreur: 'Adresse email invalide.' };
  const { error } = await supabase()
    .from('reglages')
    .upsert([
      { cle: 'instagram', valeur: instagram },
      { cle: 'email', valeur: email },
    ]);
  if (error) return { erreur: error.message };
  rafraichir();
  return { ok: 'Réglages enregistrés.' };
}

// ---------- Médias ----------

/** URL d'envoi signée : le navigateur envoie le fichier directement à Supabase Storage. */
export async function preparerEnvoi(nomFichier: string) {
  await exigerAdmin();
  const ext = (nomFichier.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const chemin = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase().storage.from(BUCKET).createSignedUploadUrl(chemin);
  if (error) throw new Error(error.message);
  return { chemin, url: data.signedUrl };
}

export async function enregistrerMedia(m: {
  type: 'img' | 'video';
  chemin: string;
  posterChemin: string | null;
  largeur: number;
  hauteur: number;
  nom: string;
}): Promise<Media> {
  await exigerAdmin();
  const publique = (c: string) => supabase().storage.from(BUCKET).getPublicUrl(c).data.publicUrl;
  const { data, error } = await supabase()
    .from('medias')
    .insert({
      type: m.type,
      url: publique(m.chemin),
      poster: m.posterChemin ? publique(m.posterChemin) : null,
      chemin: m.chemin,
      poster_chemin: m.posterChemin,
      largeur: Math.round(m.largeur),
      hauteur: Math.round(m.hauteur),
      nom: m.nom.slice(0, 200),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
  return versMedia(data);
}

export async function supprimerMedia(id: number): Promise<Etat> {
  await exigerAdmin();
  const { data: m, error } = await supabase().from('medias').select('chemin, poster_chemin').eq('id', id).single();
  if (error) return { erreur: error.message };
  const fichiers = [m.chemin, m.poster_chemin].filter(Boolean) as string[];
  if (fichiers.length) await supabase().storage.from(BUCKET).remove(fichiers);
  const { error: e2 } = await supabase().from('medias').delete().eq('id', id);
  if (e2) return { erreur: e2.message };
  rafraichir();
  return { ok: 'Média supprimé.' };
}

// ---------- Traînée du curseur ----------

export async function enregistrerCurseur(ids: number[]): Promise<Etat> {
  await exigerAdmin();
  const propres = ids.filter((i) => Number.isInteger(i) && i > 0);
  const { error } = await supabase().from('reglages').upsert({ cle: 'curseur', valeur: JSON.stringify(propres) });
  if (error) return { erreur: error.message };
  rafraichir();
  return { ok: 'Images du curseur enregistrées.' };
}

// ---------- Collage ----------

export async function enregistrerCollage(
  format: Format,
  cartes: { mediaId: number; x: number; y: number; w: number; h: number; a: number }[]
): Promise<Etat> {
  await exigerAdmin();
  if (!FORMATS.includes(format)) return { erreur: 'Format inconnu.' };
  const n = (v: number) => Math.round(Number(v) * 10) / 10;
  const lignes = cartes.map((c, i) => ({
    format,
    media_id: c.mediaId,
    x: n(c.x),
    y: n(c.y),
    w: Math.max(1, n(c.w)),
    h: Math.max(1, n(c.h)),
    a: n(c.a),
    ordre: i,
  }));
  const db = supabase();
  const { error } = await db.from('collage').delete().eq('format', format);
  if (error) return { erreur: error.message };
  if (lignes.length) {
    const { error: e2 } = await db.from('collage').insert(lignes);
    if (e2) return { erreur: e2.message };
  }
  rafraichir();
  return { ok: 'Collage enregistré.' };
}

// ---------- Projets ----------

/** Slug libre dérivé du titre : un numéro est ajouté si l'adresse est déjà prise (-2, -3…). */
async function slugLibre(titre: string, idExclu?: number) {
  const base = versSlug(titre) || 'projet';
  const { data, error } = await supabase().from('projets').select('id, slug').like('slug', `${base}%`);
  if (error) throw new Error(error.message);
  const pris = new Set((data ?? []).filter((p) => p.id !== idExclu).map((p) => p.slug));
  if (!pris.has(base)) return base;
  let n = 2;
  while (pris.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function creerProjet() {
  await exigerAdmin();
  const db = supabase();
  const { data: dernier } = await db.from('projets').select('ordre').order('ordre', { ascending: false }).limit(1);
  const { data, error } = await db
    .from('projets')
    .insert({ slug: await slugLibre('Nouveau projet'), titre: 'Nouveau projet', ordre: (dernier?.[0]?.ordre ?? -1) + 1 })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/projets/${data.id}`);
}

export interface DonneesProjet {
  titre: string;
  categorie: string;
  couvertureId: number | null;
  publie: boolean;
  titreDetail: string;
  client: string;
  annee: string;
  services: string;
  description: string;
  galerie: ({ type: 'paire'; medias: [number, number] } | { type: 'large'; media: number })[];
}

export async function enregistrerProjet(id: number, d: DonneesProjet): Promise<Etat & { slug?: string }> {
  await exigerAdmin();
  if (!d.titre.trim()) return { erreur: 'Le titre est obligatoire.' };
  // L'adresse de la page est toujours générée à partir du titre.
  const slug = await slugLibre(d.titre, id);
  if (d.publie && !d.couvertureId) return { erreur: 'Choisis une image de couverture avant de publier.' };
  const { error } = await supabase()
    .from('projets')
    .update({
      slug,
      titre: d.titre.trim(),
      categorie: d.categorie.trim(),
      couverture_id: d.couvertureId,
      publie: d.publie,
      titre_detail: d.titreDetail.trim(),
      client: d.client.trim(),
      annee: d.annee.trim(),
      services: d.services,
      description: d.description,
      galerie: d.galerie,
    })
    .eq('id', id);
  if (error) return { erreur: error.message };
  rafraichir();
  return { ok: 'Projet enregistré.', slug };
}

export async function supprimerProjet(id: number) {
  await exigerAdmin();
  const { error } = await supabase().from('projets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  rafraichir();
  redirect('/admin/projets');
}

export async function deplacerProjet(id: number, sens: -1 | 1) {
  await exigerAdmin();
  const db = supabase();
  const { data, error } = await db.from('projets').select('id, ordre').order('ordre');
  if (error) throw new Error(error.message);
  const liste = data ?? [];
  const i = liste.findIndex((p) => p.id === id);
  const j = i + sens;
  if (i < 0 || j < 0 || j >= liste.length) return;
  [liste[i], liste[j]] = [liste[j], liste[i]];
  await Promise.all(liste.map((p, k) => db.from('projets').update({ ordre: k }).eq('id', p.id)));
  rafraichir();
}
