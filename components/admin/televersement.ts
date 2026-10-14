'use client';

import { enregistrerMedia, preparerEnvoi } from '@/app/admin/actions';
import type { Media } from '@/lib/types';

/** Dimensions d'origine d'une image. */
async function infosImage(f: File) {
  const bmp = await createImageBitmap(f);
  const r = { largeur: bmp.width, hauteur: bmp.height };
  bmp.close();
  return r;
}

/** Dimensions d'une vidéo et vignette (première image) en JPEG. */
function infosVideo(f: File): Promise<{ largeur: number; hauteur: number; vignette: Blob | null }> {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;
    v.onerror = () => {
      URL.revokeObjectURL(url);
      ko(new Error(`Vidéo illisible : ${f.name}`));
    };
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.1, v.duration / 2 || 0);
    };
    v.onseeked = () => {
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d')!.drawImage(v, 0, 0);
      c.toBlob(
        (b) => {
          URL.revokeObjectURL(url);
          ok({ largeur: v.videoWidth, hauteur: v.videoHeight, vignette: b });
        },
        'image/jpeg',
        0.85
      );
    };
  });
}

/** Envoi direct vers Supabase Storage (URL signée), avec progression. */
function televerser(url: string, corps: Blob, type: string, progression?: (p: number) => void) {
  return new Promise<void>((ok, ko) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => e.lengthComputable && progression?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? ok() : ko(new Error(`Envoi refusé (${xhr.status}) : ${xhr.responseText}`)));
    xhr.onerror = () => ko(new Error('Erreur réseau pendant l’envoi.'));
    xhr.send(corps);
  });
}

export async function envoyerFichier(f: File, progression?: (p: number) => void): Promise<Media> {
  const type = f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'img' : null;
  if (!type) throw new Error(`${f.name} : seuls les images et les vidéos sont acceptées.`);

  const infos = type === 'img' ? { ...(await infosImage(f)), vignette: null } : await infosVideo(f);

  const { chemin, url } = await preparerEnvoi(f.name);
  await televerser(url, f, f.type, progression);

  let posterChemin: string | null = null;
  if (infos.vignette) {
    const p = await preparerEnvoi('vignette.jpg');
    await televerser(p.url, infos.vignette, 'image/jpeg');
    posterChemin = p.chemin;
  }

  return enregistrerMedia({ type, chemin, posterChemin, largeur: infos.largeur, hauteur: infos.hauteur, nom: f.name });
}
